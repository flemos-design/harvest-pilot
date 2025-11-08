import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface IpmaLocation {
  globalIdLocal: number;
  local: string;
  latitude: string;
  longitude: string;
  idRegiao: number;
  idDistrito: number;
}

interface IpmaForecastDay {
  forecastDate: string;
  tMin: number;
  tMax: number;
  precipitaProb: string;
  predWindDir: string;
  classWindSpeed: number;
  idWeatherType: number;
  latitude: string;
  longitude: string;
}

interface IpmaForecastResponse {
  owner: string;
  country: string;
  globalIdLocal: number;
  dataUpdate: string;
  data: IpmaForecastDay[];
}

@Injectable()
export class IpmaIntegrationService {
  private readonly logger = new Logger(IpmaIntegrationService.name);
  private readonly IPMA_BASE_URL = 'https://api.ipma.pt/open-data';
  private locationsCache: IpmaLocation[] | null = null;

  constructor(private prisma: PrismaService) {}

  /**
   * Buscar lista de locais disponíveis no IPMA
   */
  async getAvailableLocations(): Promise<IpmaLocation[]> {
    if (this.locationsCache) {
      return this.locationsCache;
    }

    try {
      const response = await fetch(`${this.IPMA_BASE_URL}/distrits-islands.json`);

      if (!response.ok) {
        throw new Error(`IPMA API error: ${response.status}`);
      }

      const data = await response.json();
      this.locationsCache = data.data || data;

      this.logger.log(`Carregados ${this.locationsCache.length} locais do IPMA`);
      return this.locationsCache;
    } catch (error) {
      this.logger.error(`Erro ao buscar locais do IPMA: ${error.message}`);
      throw error;
    }
  }

  /**
   * Encontrar local IPMA mais próximo de uma coordenada
   */
  async findNearestLocation(latitude: number, longitude: number): Promise<IpmaLocation> {
    const locations = await this.getAvailableLocations();

    let nearest: IpmaLocation | null = null;
    let minDistance = Infinity;

    for (const location of locations) {
      const lat = parseFloat(location.latitude);
      const lon = parseFloat(location.longitude);

      // Cálculo simples de distância (Haversine simplificado)
      const distance = this.calculateDistance(latitude, longitude, lat, lon);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }

    if (!nearest) {
      throw new Error('Nenhum local IPMA encontrado');
    }

    this.logger.debug(
      `Local mais próximo de (${latitude}, ${longitude}): ${nearest.local} (${minDistance.toFixed(2)} km)`,
    );

    return nearest;
  }

  /**
   * Buscar previsão meteorológica para um local IPMA
   */
  async getForecast(globalIdLocal: number): Promise<IpmaForecastResponse> {
    try {
      const url = `${this.IPMA_BASE_URL}/forecast/meteorology/cities/daily/${globalIdLocal}.json`;
      this.logger.debug(`Buscando previsão IPMA: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`IPMA API error: ${response.status}`);
      }

      const data: IpmaForecastResponse = await response.json();

      this.logger.log(
        `Previsão IPMA recebida para local ${globalIdLocal}: ${data.data.length} dias`,
      );

      return data;
    } catch (error) {
      this.logger.error(`Erro ao buscar previsão do IPMA: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sincronizar previsão meteorológica para uma parcela
   */
  async syncForecastForParcela(parcelaId: string): Promise<number> {
    this.logger.log(`Sincronizando meteorologia IPMA para parcela ${parcelaId}`);

    // 1. Buscar parcela
    const parcela = await this.prisma.parcela.findUnique({
      where: { id: parcelaId },
    });

    if (!parcela) {
      throw new Error(`Parcela ${parcelaId} não encontrada`);
    }

    // 2. Extrair coordenadas do centro da geometria
    const geometria = JSON.parse(parcela.geometria);
    const [longitude, latitude] = this.getGeometryCentroid(geometria);

    this.logger.debug(`Parcela ${parcela.nome}: coordenadas (${latitude}, ${longitude})`);

    // 3. Encontrar local IPMA mais próximo
    const location = await this.findNearestLocation(latitude, longitude);

    // 4. Buscar previsão do IPMA
    const forecast = await this.getForecast(location.globalIdLocal);

    // 5. Guardar previsões na BD (upsert)
    let count = 0;
    for (const day of forecast.data) {
      // Converter probabilidade de string para número
      const precipitaProb = parseFloat(day.precipitaProb) || 0;

      // Temperatura média (aproximação)
      const temperaturaMedia = (day.tMin + day.tMax) / 2;

      // Vento (conversão de classe para km/h aproximado)
      const vento = this.convertWindClassToSpeed(day.classWindSpeed);

      await this.prisma.meteoParcela.upsert({
        where: {
          parcelaId_data_fonte: {
            parcelaId,
            data: new Date(day.forecastDate),
            fonte: 'IPMA',
          },
        },
        update: {
          temperatura: temperaturaMedia,
          tempMin: day.tMin,
          tempMax: day.tMax,
          precipitacao: null, // IPMA não fornece mm, só probabilidade
          probChuva: precipitaProb,
          vento,
          humidade: null, // IPMA não fornece
        },
        create: {
          parcelaId,
          data: new Date(day.forecastDate),
          fonte: 'IPMA',
          temperatura: temperaturaMedia,
          tempMin: day.tMin,
          tempMax: day.tMax,
          precipitacao: null,
          probChuva: precipitaProb,
          vento,
          humidade: null,
        },
      });

      count++;
    }

    this.logger.log(`✅ ${count} previsões sincronizadas para parcela ${parcela.nome}`);
    return count;
  }

  /**
   * Sincronizar meteorologia para todas as parcelas de uma organização
   */
  async syncForecastForOrganizacao(organizacaoId: string): Promise<{ total: number; parcelas: number }> {
    this.logger.log(`Sincronizando meteorologia IPMA para organização ${organizacaoId}`);

    const parcelas = await this.prisma.parcela.findMany({
      where: {
        propriedade: {
          organizacaoId,
        },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    this.logger.log(`Encontradas ${parcelas.length} parcelas para sincronizar`);

    let totalSyncedRecords = 0;

    for (const parcela of parcelas) {
      try {
        const count = await this.syncForecastForParcela(parcela.id);
        totalSyncedRecords += count;
      } catch (error) {
        this.logger.error(`Erro ao sincronizar parcela ${parcela.nome}: ${error.message}`);
        // Continuar com as próximas parcelas mesmo se uma falhar
      }
    }

    this.logger.log(
      `✅ Sincronização completa: ${totalSyncedRecords} registos em ${parcelas.length} parcelas`,
    );

    return {
      total: totalSyncedRecords,
      parcelas: parcelas.length,
    };
  }

  /**
   * UTILITÁRIOS
   */

  /**
   * Calcular distância entre duas coordenadas (km) - Haversine simplificado
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Extrair centroid de geometria GeoJSON
   */
  private getGeometryCentroid(geometria: any): [number, number] {
    // Assumindo Polygon ou MultiPolygon
    let coordinates: number[][];

    if (geometria.type === 'Polygon') {
      coordinates = geometria.coordinates[0];
    } else if (geometria.type === 'MultiPolygon') {
      coordinates = geometria.coordinates[0][0];
    } else if (geometria.type === 'Point') {
      return geometria.coordinates;
    } else {
      throw new Error(`Tipo de geometria não suportado: ${geometria.type}`);
    }

    // Calcular centroid médio
    const sum = coordinates.reduce(
      (acc, coord) => {
        acc[0] += coord[0]; // longitude
        acc[1] += coord[1]; // latitude
        return acc;
      },
      [0, 0],
    );

    const lon = sum[0] / coordinates.length;
    const lat = sum[1] / coordinates.length;

    return [lon, lat];
  }

  /**
   * Converter classe de vento IPMA para velocidade aproximada (km/h)
   */
  private convertWindClassToSpeed(classWindSpeed: number): number {
    // Aproximação baseada na documentação IPMA
    const mapping: Record<number, number> = {
      1: 10, // Fraco
      2: 25, // Moderado
      3: 40, // Forte
      4: 55, // Muito forte
      5: 70, // Extremamente forte
    };

    return mapping[classWindSpeed] || 10;
  }
}

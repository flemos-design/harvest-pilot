import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMeteoParcelaDto } from './dto/create-meteo-parcela.dto';
import { UpdateMeteoParcelaDto } from './dto/update-meteo-parcela.dto';

@Injectable()
export class MeteorologiaService {
  constructor(private prisma: PrismaService) {}

  async create(createMeteoParcelaDto: CreateMeteoParcelaDto) {
    return this.prisma.meteoParcela.create({
      data: {
        ...createMeteoParcelaDto,
        data: new Date(createMeteoParcelaDto.data),
      },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            area: true,
          },
        },
      },
    });
  }

  async findAll(parcelaId?: string, fonte?: string) {
    const where: any = {};
    if (parcelaId) where.parcelaId = parcelaId;
    if (fonte) where.fonte = fonte;

    return this.prisma.meteoParcela.findMany({
      where,
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            area: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const meteo = await this.prisma.meteoParcela.findUnique({
      where: { id },
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });

    if (!meteo) {
      throw new NotFoundException(`Dados meteorológicos com ID ${id} não encontrados`);
    }

    return meteo;
  }

  async getLatestByParcela(parcelaId: string) {
    return this.prisma.meteoParcela.findFirst({
      where: { parcelaId },
      orderBy: { data: 'desc' },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async getForecast(parcelaId: string, days: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.meteoParcela.findMany({
      where: {
        parcelaId,
        data: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { data: 'asc' },
      select: {
        id: true,
        data: true,
        fonte: true,
        temperatura: true,
        tempMin: true,
        tempMax: true,
        precipitacao: true,
        probChuva: true,
        vento: true,
        humidade: true,
      },
    });
  }

  async getHistorico(parcelaId: string, startDate?: string, endDate?: string) {
    const where: any = { parcelaId };

    if (startDate || endDate) {
      where.data = {};
      if (startDate) where.data.gte = new Date(startDate);
      if (endDate) where.data.lte = new Date(endDate);
    }

    return this.prisma.meteoParcela.findMany({
      where,
      orderBy: { data: 'asc' },
      select: {
        id: true,
        data: true,
        fonte: true,
        temperatura: true,
        tempMin: true,
        tempMax: true,
        precipitacao: true,
        vento: true,
        humidade: true,
      },
    });
  }

  async getStats(parcelaId: string, startDate?: string, endDate?: string) {
    const where: any = { parcelaId };

    if (startDate || endDate) {
      where.data = {};
      if (startDate) where.data.gte = new Date(startDate);
      if (endDate) where.data.lte = new Date(endDate);
    }

    const dados = await this.prisma.meteoParcela.findMany({
      where,
      select: {
        temperatura: true,
        tempMin: true,
        tempMax: true,
        precipitacao: true,
        vento: true,
        humidade: true,
      },
    });

    if (dados.length === 0) {
      return null;
    }

    const stats = {
      temperaturaMedia: this.calcularMedia(dados.map((d) => d.temperatura)),
      tempMinMedia: this.calcularMedia(dados.map((d) => d.tempMin)),
      tempMaxMedia: this.calcularMedia(dados.map((d) => d.tempMax)),
      precipitacaoTotal: this.calcularSoma(dados.map((d) => d.precipitacao)),
      ventoMedio: this.calcularMedia(dados.map((d) => d.vento)),
      humidadeMedia: this.calcularMedia(dados.map((d) => d.humidade)),
      totalRegistos: dados.length,
    };

    return stats;
  }

  async update(id: string, updateMeteoParcelaDto: UpdateMeteoParcelaDto) {
    const meteo = await this.prisma.meteoParcela.findUnique({
      where: { id },
    });

    if (!meteo) {
      throw new NotFoundException(`Dados meteorológicos com ID ${id} não encontrados`);
    }

    return this.prisma.meteoParcela.update({
      where: { id },
      data: {
        ...updateMeteoParcelaDto,
        ...(updateMeteoParcelaDto.data && { data: new Date(updateMeteoParcelaDto.data) }),
      },
      include: {
        parcela: true,
      },
    });
  }

  async remove(id: string) {
    const meteo = await this.prisma.meteoParcela.findUnique({
      where: { id },
    });

    if (!meteo) {
      throw new NotFoundException(`Dados meteorológicos com ID ${id} não encontrados`);
    }

    await this.prisma.meteoParcela.delete({
      where: { id },
    });
  }

  // Métodos auxiliares
  private calcularMedia(valores: (number | null | undefined)[]): number | null {
    const validos = valores.filter((v): v is number => v !== null && v !== undefined);
    if (validos.length === 0) return null;
    return validos.reduce((sum, v) => sum + v, 0) / validos.length;
  }

  private calcularSoma(valores: (number | null | undefined)[]): number {
    const validos = valores.filter((v): v is number => v !== null && v !== undefined);
    return validos.reduce((sum, v) => sum + v, 0);
  }
}

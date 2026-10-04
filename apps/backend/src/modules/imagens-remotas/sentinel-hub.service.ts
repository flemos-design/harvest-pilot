import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { RGB_SCRIPT, STATS_SCRIPT } from './satellite-evalscripts';
import axios, { AxiosInstance } from 'axios';

interface SentinelScene {
  id: string;
  datetime: string;
  cloudCover: number | null;
}

interface Geometry {
  type: string;
  coordinates: unknown;
}

interface IndexStats {
  ndvi: number | null;
  ndre: number | null;
  evi: number | null;
  cloudPercent: number | null;
  validPercent: number | null;
}

export interface SentinelConfigurationStatus {
  configured: boolean;
  missing: string[];
}

@Injectable()
export class SentinelHubService {
  private readonly logger = new Logger(SentinelHubService.name);
  private readonly stacUrl = 'https://stac.dataspace.copernicus.eu/v1/search';
  private readonly processUrl = 'https://services.sentinel-hub.com/api/v1/process';
  private readonly statisticsUrl = 'https://services.sentinel-hub.com/api/v1/statistics';
  private readonly http: AxiosInstance = axios.create({ timeout: 45_000 });
  private accessToken: { value: string; expiresAt: number } | null = null;

  isConfigured(): boolean {
    return this.getConfigurationStatus().configured;
  }

  getConfigurationStatus(): SentinelConfigurationStatus {
    const missing: string[] = [];
    if (!process.env.SENTINEL_CLIENT_ID) missing.push('SENTINEL_CLIENT_ID');
    if (!process.env.SENTINEL_CLIENT_SECRET) missing.push('SENTINEL_CLIENT_SECRET');
    return { configured: missing.length === 0, missing };
  }

  async findLatestScene(
    geometry: Geometry,
    from: Date,
    to: Date,
    maxCloud: number,
  ): Promise<SentinelScene[]> {
    const response = await this.http.post(this.stacUrl, {
      collections: ['sentinel-2-l2a'],
      datetime: `${from.toISOString()}/${to.toISOString()}`,
      intersects: geometry,
      query: { 'eo:cloud_cover': { lte: maxCloud } },
      limit: 10,
      sortby: [{ field: 'properties.datetime', direction: 'desc' }],
    });

    return (response.data?.features || []).map((item: any) => ({
      id: item.id,
      datetime: item.properties?.datetime || item.properties?.start_datetime,
      cloudCover: item.properties?.['eo:cloud_cover'] ?? null,
    }));
  }

  async renderPreview(geometry: Geometry, from: Date, to: Date): Promise<Buffer> {
    const response = await this.http.post(
      this.processUrl,
      {
        input: {
          bounds: {
            bbox: this.getBbox(geometry),
            geometry,
            properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' },
          },
          data: [{
            type: 'sentinel-2-l2a',
            dataFilter: { timeRange: { from: from.toISOString(), to: to.toISOString() }, mosaickingOrder: 'leastCC' },
          }],
        },
        output: {
          width: 512,
          height: 512,
          responses: [{ identifier: 'default', format: { type: 'image/png' } }],
        },
        evalscript: RGB_SCRIPT,
      },
      {
        headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
        responseType: 'arraybuffer',
      },
    );

    return Buffer.from(response.data);
  }

  async calculateStats(geometry: Geometry, from: Date, to: Date): Promise<IndexStats> {
    const response = await this.http.post(
      this.statisticsUrl,
      {
        input: {
          bounds: {
            bbox: this.getBbox(geometry),
            geometry,
            properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' },
          },
          data: [{ type: 'sentinel-2-l2a', dataFilter: { mosaickingOrder: 'leastCC' } }],
        },
        aggregation: {
          timeRange: { from: from.toISOString(), to: to.toISOString() },
          aggregationInterval: { of: 'P1D' },
          resx: 10,
          resy: 10,
          evalscript: STATS_SCRIPT,
        },
        calculations: { default: {} },
      },
      { headers: { Authorization: `Bearer ${await this.getAccessToken()}` } },
    );

    const interval = response.data?.data?.[0];
    const outputs = interval?.outputs || {};
    const stat = (name: string) => outputs[name]?.bands?.B0?.stats;
    const mean = (name: string): number | null => stat(name)?.mean ?? null;
    const indexStats = stat('ndvi');
    const geometryPixelCount = response.data?.geometryPixelCount;
    const validPercent = geometryPixelCount && indexStats?.sampleCount !== undefined
      ? (indexStats.sampleCount / geometryPixelCount) * 100
      : null;
    const cloudMean = mean('cloud');
    return {
      ndvi: mean('ndvi'),
      ndre: mean('ndre'),
      evi: mean('evi'),
      cloudPercent: cloudMean === null ? null : cloudMean * 100,
      validPercent,
    };
  }

  private async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Integração Sentinel Hub não configurada');
    }

    if (this.accessToken && this.accessToken.expiresAt > Date.now() + 60_000) {
      return this.accessToken.value;
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SENTINEL_CLIENT_ID as string,
      client_secret: process.env.SENTINEL_CLIENT_SECRET as string,
    });
    const response = await this.http.post(
      'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    this.accessToken = {
      value: response.data.access_token,
      expiresAt: Date.now() + Number(response.data.expires_in || 300) * 1000,
    };
    this.logger.debug('Token Sentinel Hub renovado');
    return this.accessToken.value;
  }

  private getBbox(geometry: Geometry): [number, number, number, number] {
    const points: number[][] = [];
    const collect = (value: unknown): void => {
      if (Array.isArray(value) && value.length >= 2 && value.every((item) => typeof item === 'number')) {
        points.push([value[0] as number, value[1] as number]);
        return;
      }
      if (Array.isArray(value)) value.forEach(collect);
    };
    collect(geometry.coordinates);
    if (!points.length) throw new Error('A geometria da parcela não contém coordenadas válidas');

    const longitudes = points.map(([longitude]) => longitude);
    const latitudes = points.map(([, latitude]) => latitude);
    return [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)];
  }
}

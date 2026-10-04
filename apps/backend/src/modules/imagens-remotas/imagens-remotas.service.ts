import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateImagemRemotaDto } from './dto/create-imagem-remota.dto';
import { UpdateImagemRemotaDto } from './dto/update-imagem-remota.dto';
import { SentinelHubService } from './sentinel-hub.service';
import { parseSatelliteGeometry } from './satellite-geometry';

@Injectable()
export class ImagensRemotasService {
  private readonly logger = new Logger(ImagensRemotasService.name);

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private sentinelHub: SentinelHubService,
  ) {}

  getConfigurationStatus() {
    const sentinel = this.sentinelHub.getConfigurationStatus();
    const storage = this.uploadService.getConfigurationStatus();
    return {
      ready: sentinel.configured && storage.configured,
      sentinel,
      storage,
    };
  }

  async syncOrganizacao(organizacaoId: string, lookbackDays = 30, maxCloud = 30) {
    const configuration = this.getConfigurationStatus();
    if (!configuration.ready) {
      throw new ServiceUnavailableException({
        code: 'SATELLITE_NOT_CONFIGURED',
        message: 'A sincronização de imagens de satélite não está configurada no servidor',
        missing: [
          ...configuration.sentinel.missing,
          ...configuration.storage.missing,
        ],
      });
    }

    const safeLookbackDays = Math.min(90, Math.max(1, Number.isFinite(lookbackDays) ? lookbackDays : 30));
    const safeMaxCloud = Math.min(80, Math.max(0, Number.isFinite(maxCloud) ? maxCloud : 30));
    const parcelas = await this.prisma.parcela.findMany({
      where: { propriedade: { organizacaoId } },
      select: { id: true, geometria: true, nome: true },
    });
    const resultados = [];

    for (const parcela of parcelas) {
      resultados.push(await this.syncParcela(parcela, safeLookbackDays, safeMaxCloud));
    }

    return {
      organizacaoId,
      lookbackDays: safeLookbackDays,
      maxCloud: safeMaxCloud,
      parcelas: parcelas.length,
      atualizadas: resultados.filter((result) => result.status === 'updated').length,
      semCaptura: resultados.filter((result) => result.status === 'no-scene').length,
      ignoradas: resultados.filter((result) => result.status === 'skipped').length,
      falhas: resultados.filter((result) => result.status === 'failed').length,
      resultados,
    };
  }

  private async syncParcela(
    parcela: { id: string; nome: string; geometria: string },
    lookbackDays: number,
    maxCloud: number,
  ) {
    let failureReason = 'invalid-geometry';
    try {
      const geometry = parseSatelliteGeometry(parcela.geometria);
      const to = new Date();
      const from = new Date(to.getTime() - Math.max(1, lookbackDays) * 24 * 60 * 60 * 1000);
      failureReason = 'provider-error';
      const scenes = await this.sentinelHub.findLatestScene(geometry, from, to, maxCloud);

      if (!scenes.length) return { parcelaId: parcela.id, parcela: parcela.nome, status: 'no-scene' };

      const fonte = 'SENTINEL-2';
      const attemptedDays = new Set<string>();
      let candidateFailures = 0;
      for (const scene of scenes) {
        const sceneDate = new Date(scene.datetime);
        if (Number.isNaN(sceneDate.getTime())) continue;
        const day = sceneDate.toISOString().slice(0, 10);
        if (attemptedDays.has(day)) continue;
        attemptedDays.add(day);

        failureReason = 'persistence-error';
        const existing = await this.prisma.imagemRemota.findUnique({
          where: { parcelaId_data_fonte: { parcelaId: parcela.id, data: sceneDate, fonte } },
          select: { id: true },
        });
        if (existing) return { parcelaId: parcela.id, parcela: parcela.nome, status: 'skipped', reason: 'already-synced' };

        const captureFrom = new Date(sceneDate);
        captureFrom.setUTCHours(0, 0, 0, 0);
        const captureTo = new Date(captureFrom.getTime() + 24 * 60 * 60 * 1000 - 1);
        try {
          failureReason = 'provider-error';
          const [preview, stats] = await Promise.all([
            this.sentinelHub.renderPreview(geometry, captureFrom, captureTo),
            this.sentinelHub.calculateStats(geometry, captureFrom, captureTo),
          ]);
          if (stats.ndvi === null || stats.ndre === null || stats.evi === null ||
            (stats.validPercent === null || stats.validPercent < 70)) continue;

          failureReason = 'storage-error';
          const stored = await this.uploadService.uploadBuffer(preview, `satellite/${parcela.id}`, 'png', 'image/png');
          failureReason = 'persistence-error';
          await this.prisma.imagemRemota.create({
            data: {
              parcelaId: parcela.id,
              fonte,
              data: sceneDate,
              nuvens: stats.cloudPercent ?? scene.cloudCover,
              ndvi: stats.ndvi,
              ndre: stats.ndre,
              evi: stats.evi,
              urlImagem: stored.url,
              metadados: {
                provider: 'Sentinel Hub',
                collection: 'sentinel-2-l2a',
                sceneId: scene.id,
                validPercent: stats.validPercent,
                cloudPercent: stats.cloudPercent,
                objectKey: stored.key,
                attribution: `Contains modified Copernicus Sentinel data ${sceneDate.getUTCFullYear()} processed by Sentinel Hub`,
              },
            },
          });
          return { parcelaId: parcela.id, parcela: parcela.nome, status: 'updated', sceneId: scene.id, data: sceneDate };
        } catch (error) {
          candidateFailures += 1;
          this.logger.warn(`Candidato Sentinel-2 ${scene.id} rejeitado (${failureReason}): ${error.message}`);
        }
      }

      if (candidateFailures > 0) {
        return { parcelaId: parcela.id, parcela: parcela.nome, status: 'failed', reason: failureReason };
      }
      return { parcelaId: parcela.id, parcela: parcela.nome, status: 'no-scene', reason: 'no-valid-capture' };
    } catch (error) {
      this.logger.error(`Falha ao sincronizar imagens da parcela ${parcela.id}: ${failureReason}`);
      return { parcelaId: parcela.id, parcela: parcela.nome, status: 'failed', reason: failureReason };
    }
  }

  async create(createImagemRemotaDto: CreateImagemRemotaDto, organizacaoId: string) {
    const parcela = await this.prisma.parcela.findFirst({
      where: { id: createImagemRemotaDto.parcelaId, propriedade: { organizacaoId } },
      select: { id: true },
    });
    if (!parcela) throw new NotFoundException('Parcela não encontrada nesta organização');

    return this.prisma.imagemRemota.create({
      data: {
        ...createImagemRemotaDto,
        data: new Date(createImagemRemotaDto.data),
      },
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });
  }

  async findAll(parcelaId: string | undefined, organizacaoId: string) {
    const where = {
      ...(parcelaId ? { parcelaId } : {}),
      parcela: { propriedade: { organizacaoId } },
    };

    return this.prisma.imagemRemota.findMany({
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

  async findOne(id: string, organizacaoId: string) {
    const imagemRemota = await this.prisma.imagemRemota.findFirst({
      where: { id, parcela: { propriedade: { organizacaoId } } },
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });

    if (!imagemRemota) {
      throw new NotFoundException(`Imagem remota com ID ${id} não encontrada`);
    }

    return imagemRemota;
  }

  async getLatestByParcela(parcelaId: string, organizacaoId: string) {
    return this.prisma.imagemRemota.findFirst({
      where: { parcelaId, parcela: { propriedade: { organizacaoId } } },
      orderBy: { data: 'desc' },
    });
  }

  async getTimeSeries(parcelaId: string, startDate: string | undefined, endDate: string | undefined, organizacaoId: string) {
    const where: any = { parcelaId, parcela: { propriedade: { organizacaoId } } };

    if (startDate || endDate) {
      where.data = {};
      if (startDate) where.data.gte = new Date(startDate);
      if (endDate) where.data.lte = new Date(endDate);
    }

    return this.prisma.imagemRemota.findMany({
      where,
      orderBy: { data: 'asc' },
      select: {
        id: true,
        data: true,
        ndvi: true,
        ndre: true,
        evi: true,
        fonte: true,
        nuvens: true,
      },
    });
  }

  async update(id: string, updateImagemRemotaDto: UpdateImagemRemotaDto, organizacaoId: string) {
    await this.findOne(id, organizacaoId);

    const { parcelaId, ...safeUpdateData } = updateImagemRemotaDto as UpdateImagemRemotaDto & { parcelaId?: string };
    const updateData: any = { ...safeUpdateData };
    if (parcelaId) {
      const parcela = await this.prisma.parcela.findFirst({
        where: { id: parcelaId, propriedade: { organizacaoId } },
        select: { id: true },
      });
      if (!parcela) throw new NotFoundException('Parcela não encontrada nesta organização');
      updateData.parcelaId = parcelaId;
    }
    if (updateImagemRemotaDto.data) {
      updateData.data = new Date(updateImagemRemotaDto.data);
    }

    return this.prisma.imagemRemota.update({
      where: { id },
      data: updateData,
      include: {
        parcela: {
          include: {
            propriedade: true,
          },
        },
      },
    });
  }

  async remove(id: string, organizacaoId: string) {
    await this.findOne(id, organizacaoId);

    await this.prisma.imagemRemota.delete({
      where: { id },
    });
  }
}

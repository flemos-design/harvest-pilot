import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ImagensRemotasService } from './imagens-remotas.service';

@Injectable()
export class SatelliteAutoSyncService {
  private readonly logger = new Logger(SatelliteAutoSyncService.name);

  constructor(
    private prisma: PrismaService,
    private imagensRemotasService: ImagensRemotasService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async syncAllOrganizationsDaily(): Promise<void> {
    if (process.env.SATELLITE_AUTO_SYNC !== 'true') {
      this.logger.debug('Sincronização Sentinel-2 automática desativada');
      return;
    }

    if (!this.imagensRemotasService.getConfigurationStatus().ready) {
      this.logger.warn('Sincronização Sentinel-2 ignorada: configuração Sentinel Hub ou armazenamento em falta');
      return;
    }

    const organizacoes = await this.prisma.organizacao.findMany({ select: { id: true } });
    for (const organizacao of organizacoes) {
      try {
        const result = await this.imagensRemotasService.syncOrganizacao(organizacao.id);
        this.logger.log(
          `Sincronização Sentinel-2 concluída para ${organizacao.id}: ${result.atualizadas} novas, ${result.falhas} falhas`,
        );
      } catch (error) {
        this.logger.error(`Falha na sincronização Sentinel-2 da organização ${organizacao.id}: ${error.message}`);
      }
    }
  }
}

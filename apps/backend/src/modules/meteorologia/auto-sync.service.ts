import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IpmaIntegrationService } from './ipma-integration.service';

interface SyncStatus {
  organizacaoId: string;
  lastSync: Date;
  status: 'syncing' | 'completed' | 'failed';
}

@Injectable()
export class AutoSyncService {
  private readonly logger = new Logger(AutoSyncService.name);
  private syncCache = new Map<string, SyncStatus>();
  private readonly SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

  constructor(
    private prisma: PrismaService,
    private ipmaService: IpmaIntegrationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAllOrganizationsDaily(): Promise<void> {
    const organizacoes = await this.prisma.organizacao.findMany({ select: { id: true } });
    for (const organizacao of organizacoes) {
      await this.checkAndSyncIfNeeded(organizacao.id);
    }
  }

  /**
   * Verificar e sincronizar meteorologia se necessário
   * Retorna true se sincronizou, false se ainda está válido
   */
  async checkAndSyncIfNeeded(organizacaoId: string): Promise<boolean> {
    // Verificar cache em memória
    const cached = this.syncCache.get(organizacaoId);
    if (cached && cached.status === 'syncing') {
      this.logger.debug(`Sincronização já em curso para org ${organizacaoId}`);
      return false;
    }

    // Verificar se precisa sincronizar
    const needsSync = await this.needsSync(organizacaoId);

    if (!needsSync) {
      this.logger.debug(`Meteorologia ainda válida para org ${organizacaoId}`);
      return false;
    }

    // Iniciar sincronização
    this.logger.log(`🌤️ Iniciando sincronização automática IPMA para org ${organizacaoId}`);

    this.syncCache.set(organizacaoId, {
      organizacaoId,
      lastSync: new Date(),
      status: 'syncing',
    });

    try {
      const result = await this.ipmaService.syncForecastForOrganizacao(organizacaoId);

      this.syncCache.set(organizacaoId, {
        organizacaoId,
        lastSync: new Date(),
        status: 'completed',
      });

      this.logger.log(
        `✅ Sincronização IPMA completa: ${result.total} registos em ${result.parcelas} parcelas`,
      );

      return true;
    } catch (error) {
      this.syncCache.set(organizacaoId, {
        organizacaoId,
        lastSync: new Date(),
        status: 'failed',
      });

      this.logger.error(`❌ Erro na sincronização IPMA: ${error.message}`);
      return false;
    }
  }

  /**
   * Verificar se precisa sincronizar
   */
  private async needsSync(organizacaoId: string): Promise<boolean> {
    // Verificar cache em memória
    const cached = this.syncCache.get(organizacaoId);
    if (cached && cached.status === 'completed') {
      const timeSinceSync = Date.now() - cached.lastSync.getTime();
      if (timeSinceSync < this.SYNC_INTERVAL_MS) {
        return false;
      }
    }

    // Verificar último registo na BD
    const lastMeteo = await this.prisma.meteoParcela.findFirst({
      where: {
        parcela: {
          propriedade: {
            organizacaoId,
          },
        },
        fonte: 'IPMA',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    if (!lastMeteo) {
      // Nunca sincronizou
      return true;
    }

    const timeSinceLastSync = Date.now() - lastMeteo.createdAt.getTime();
    return timeSinceLastSync >= this.SYNC_INTERVAL_MS;
  }

  /**
   * Limpar cache (útil para testes)
   */
  clearCache(organizacaoId?: string) {
    if (organizacaoId) {
      this.syncCache.delete(organizacaoId);
    } else {
      this.syncCache.clear();
    }
  }

  /**
   * Obter status de sincronização
   */
  getSyncStatus(organizacaoId: string): SyncStatus | null {
    return this.syncCache.get(organizacaoId) || null;
  }
}

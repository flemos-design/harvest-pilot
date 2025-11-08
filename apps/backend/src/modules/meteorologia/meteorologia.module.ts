import { Module } from '@nestjs/common';
import { MeteorologiaService } from './meteorologia.service';
import { MeteorologiaController } from './meteorologia.controller';
import { IpmaIntegrationService } from './ipma-integration.service';
import { AutoSyncService } from './auto-sync.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeteorologiaController],
  providers: [MeteorologiaService, IpmaIntegrationService, AutoSyncService],
  exports: [MeteorologiaService, IpmaIntegrationService, AutoSyncService],
})
export class MeteorologiaModule {}

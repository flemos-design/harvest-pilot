import { Module } from '@nestjs/common';
import { ImagensRemotasService } from './imagens-remotas.service';
import { ImagensRemotasController } from './imagens-remotas.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { SentinelHubService } from './sentinel-hub.service';
import { SatelliteAutoSyncService } from './satellite-auto-sync.service';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ImagensRemotasController],
  providers: [ImagensRemotasService, SentinelHubService, SatelliteAutoSyncService],
  exports: [ImagensRemotasService],
})
export class ImagensRemotasModule {}

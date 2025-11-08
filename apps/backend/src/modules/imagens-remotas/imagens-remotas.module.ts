import { Module } from '@nestjs/common';
import { ImagensRemotasService } from './imagens-remotas.service';
import { ImagensRemotasController } from './imagens-remotas.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImagensRemotasController],
  providers: [ImagensRemotasService],
  exports: [ImagensRemotasService],
})
export class ImagensRemotasModule {}

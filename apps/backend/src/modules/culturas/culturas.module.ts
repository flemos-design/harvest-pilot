import { Module } from '@nestjs/common';
import { CulturasService } from './culturas.service';
import { CulturasController } from './culturas.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CulturasController],
  providers: [CulturasService],
  exports: [CulturasService],
})
export class CulturasModule {}


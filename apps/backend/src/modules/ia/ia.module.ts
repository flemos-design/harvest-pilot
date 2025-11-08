import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [IaController],
  providers: [IaService, PrismaService],
  exports: [IaService],
})
export class IaModule {}

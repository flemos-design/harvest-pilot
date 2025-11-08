import { Module } from '@nestjs/common';
import { UtilizadoresService } from './utilizadores.service';
import { UtilizadoresController } from './utilizadores.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UtilizadoresController],
  providers: [UtilizadoresService],
  exports: [UtilizadoresService],
})
export class UtilizadoresModule {}

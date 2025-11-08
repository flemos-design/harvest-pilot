import { Module } from '@nestjs/common';
import { UtilizadoresService } from './utilizadores.service';
import { UtilizadoresController } from './utilizadores.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [UtilizadoresController],
  providers: [UtilizadoresService],
  exports: [UtilizadoresService],
})
export class UtilizadoresModule {}

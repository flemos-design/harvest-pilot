import { Module } from '@nestjs/common';
import { UtilizadoresService } from './utilizadores.service';
import { UtilizadoresController } from './utilizadores.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, EmailModule, AuthModule],
  controllers: [UtilizadoresController],
  providers: [UtilizadoresService],
  exports: [UtilizadoresService],
})
export class UtilizadoresModule {}

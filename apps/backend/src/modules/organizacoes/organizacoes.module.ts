import { Module } from '@nestjs/common';
import { OrganizacoesService } from './organizacoes.service';
import { OrganizacoesController } from './organizacoes.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizacoesController],
  providers: [OrganizacoesService],
  exports: [OrganizacoesService],
})
export class OrganizacoesModule {}

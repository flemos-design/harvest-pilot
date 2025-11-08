import { Module } from '@nestjs/common';
import { MeteorologiaService } from './meteorologia.service';
import { MeteorologiaController } from './meteorologia.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeteorologiaController],
  providers: [MeteorologiaService],
  exports: [MeteorologiaService],
})
export class MeteorologiaModule {}

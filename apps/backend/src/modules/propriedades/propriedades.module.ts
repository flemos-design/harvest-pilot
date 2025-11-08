import { Module } from '@nestjs/common';
import { PropriedadesService } from './propriedades.service';
import { PropriedadesController } from './propriedades.controller';

@Module({
  controllers: [PropriedadesController],
  providers: [PropriedadesService],
  exports: [PropriedadesService],
})
export class PropriedadesModule {}

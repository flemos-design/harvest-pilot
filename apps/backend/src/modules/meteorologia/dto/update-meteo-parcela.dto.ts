import { PartialType } from '@nestjs/swagger';
import { CreateMeteoParcelaDto } from './create-meteo-parcela.dto';

export class UpdateMeteoParcelaDto extends PartialType(CreateMeteoParcelaDto) {}

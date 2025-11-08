import { PartialType } from '@nestjs/swagger';
import { CreateCalendarioRegraDto } from './create-calendario-regra.dto';

export class UpdateCalendarioRegraDto extends PartialType(CreateCalendarioRegraDto) {}

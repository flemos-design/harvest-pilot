import { PartialType } from '@nestjs/swagger';
import { CreateOperacaoDto } from './create-operacao.dto';

export class UpdateOperacaoDto extends PartialType(CreateOperacaoDto) {}

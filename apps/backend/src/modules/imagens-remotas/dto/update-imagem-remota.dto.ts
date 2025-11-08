import { PartialType } from '@nestjs/swagger';
import { CreateImagemRemotaDto } from './create-imagem-remota.dto';

export class UpdateImagemRemotaDto extends PartialType(CreateImagemRemotaDto) {}

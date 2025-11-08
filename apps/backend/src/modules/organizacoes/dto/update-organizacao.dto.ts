import { PartialType } from '@nestjs/swagger';
import { CreateOrganizacaoDto } from './create-organizacao.dto';

export class UpdateOrganizacaoDto extends PartialType(CreateOrganizacaoDto) {}

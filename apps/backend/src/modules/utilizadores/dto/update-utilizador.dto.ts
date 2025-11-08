import { PartialType } from '@nestjs/swagger';
import { CreateUtilizadorDto } from './create-utilizador.dto';
import { OmitType } from '@nestjs/swagger';

// Remove password do update - use endpoint separado para alterar password
export class UpdateUtilizadorDto extends PartialType(
  OmitType(CreateUtilizadorDto, ['password'] as const)
) {}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class CreateOrganizacaoDto {
  @ApiProperty({ description: 'Nome da organização', example: 'Quinta do Vale Verde' })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Slug único para a organização (URL-friendly)',
    example: 'quinta-vale-verde',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePropriedadeDto {
  @ApiProperty({ description: 'Nome da propriedade' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Descrição da propriedade', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ description: 'ID da organização' })
  @IsString()
  organizacaoId: string;
}

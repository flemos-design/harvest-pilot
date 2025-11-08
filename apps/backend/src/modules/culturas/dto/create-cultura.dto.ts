import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateCulturaDto {
  @ApiProperty({
    description: 'Espécie da cultura',
    example: 'Castanheiro',
  })
  @IsString()
  @MinLength(2, { message: 'Espécie deve ter pelo menos 2 caracteres' })
  especie: string;

  @ApiProperty({
    description: 'Variedade da cultura',
    example: 'Longal',
    required: false,
  })
  @IsOptional()
  @IsString()
  variedade?: string;

  @ApiProperty({
    description: 'Finalidade da cultura',
    example: 'FRUTO',
    enum: ['FRUTO', 'MADEIRA'],
    default: 'FRUTO',
  })
  @IsOptional()
  @IsIn(['FRUTO', 'MADEIRA'], {
    message: 'Finalidade deve ser FRUTO ou MADEIRA',
  })
  finalidade?: string;

  @ApiProperty({
    description: 'ID da parcela onde a cultura está plantada',
    example: 'clxyz123abc',
  })
  @IsString()
  parcelaId: string;
}

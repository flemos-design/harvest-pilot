import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

export enum Finalidade {
  FRUTO = 'FRUTO',
  MADEIRA = 'MADEIRA',
}

export class CreateCalendarioRegraDto {
  @ApiProperty({ description: 'Cultura agrícola', example: 'Castanheiro' })
  @IsString()
  cultura: string;

  @ApiProperty({ description: 'Variedade da cultura', example: 'Longal', required: false })
  @IsOptional()
  @IsString()
  variedade?: string;

  @ApiProperty({
    description: 'Finalidade da cultura',
    enum: Finalidade,
    default: Finalidade.FRUTO,
  })
  @IsOptional()
  @IsEnum(Finalidade)
  finalidade?: Finalidade;

  @ApiProperty({ description: 'Tipo de operação', example: 'COLHEITA' })
  @IsString()
  tipoOperacao: string;

  @ApiProperty({ description: 'Região', example: 'Espinhosela', required: false, default: 'Espinhosela' })
  @IsOptional()
  @IsString()
  regiao?: string;

  @ApiProperty({ description: 'Mês de início (1-12)', example: 9, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  mesInicio: number;

  @ApiProperty({ description: 'Mês de fim (1-12)', example: 10, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  mesFim: number;

  @ApiProperty({
    description: 'Temperatura base para GDD (°C)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  tbase?: number;

  @ApiProperty({
    description: 'GDD alvo (graus-dia acumulados)',
    example: 1200,
    required: false,
  })
  @IsOptional()
  @IsInt()
  gddAlvo?: number;

  @ApiProperty({
    description: 'Velocidade máxima do vento (km/h)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ventoMax?: number;

  @ApiProperty({
    description: 'Precipitação máxima (mm)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chuvaMax?: number;

  @ApiProperty({
    description: 'PHI - Período de segurança pré-colheita (dias)',
    example: 14,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  phiDias?: number;

  @ApiProperty({
    description: 'Descrição da regra',
    example: 'Colheita de castanhas quando atingir maturação completa',
    required: false,
  })
  @IsOptional()
  @IsString()
  descricao?: string;
}

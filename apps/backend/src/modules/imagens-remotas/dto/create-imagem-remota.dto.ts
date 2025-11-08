import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateImagemRemotaDto {
  @ApiProperty({ description: 'Data de captura da imagem', example: '2024-01-15' })
  @IsDateString()
  data: string;

  @ApiProperty({ description: 'Fonte da imagem', example: 'SENTINEL' })
  @IsOptional()
  @IsString()
  fonte?: string;

  @ApiProperty({ description: 'Percentagem de nuvens', example: 5.5, required: false })
  @IsOptional()
  @IsNumber()
  nuvens?: number;

  @ApiProperty({ description: 'Índice NDVI', example: 0.75, required: false })
  @IsOptional()
  @IsNumber()
  ndvi?: number;

  @ApiProperty({ description: 'Índice NDRE', example: 0.65, required: false })
  @IsOptional()
  @IsNumber()
  ndre?: number;

  @ApiProperty({ description: 'Índice EVI', example: 0.80, required: false })
  @IsOptional()
  @IsNumber()
  evi?: number;

  @ApiProperty({ description: 'URL da imagem', required: false })
  @IsOptional()
  @IsString()
  urlImagem?: string;

  @ApiProperty({ description: 'Metadados adicionais', required: false })
  @IsOptional()
  @IsObject()
  metadados?: any;

  @ApiProperty({ description: 'ID da parcela associada' })
  @IsString()
  parcelaId: string;
}

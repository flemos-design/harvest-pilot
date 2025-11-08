import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateMeteoParcelaDto {
  @ApiProperty({ description: 'ID da parcela' })
  @IsString()
  parcelaId: string;

  @ApiProperty({ description: 'Data da previsão/observação', example: '2024-11-08' })
  @IsDateString()
  data: string;

  @ApiProperty({ description: 'Fonte dos dados', example: 'IPMA', default: 'IPMA' })
  @IsOptional()
  @IsString()
  fonte?: string;

  @ApiProperty({ description: 'Temperatura (°C)', example: 18.5, required: false })
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @ApiProperty({ description: 'Temperatura mínima (°C)', example: 12.0, required: false })
  @IsOptional()
  @IsNumber()
  tempMin?: number;

  @ApiProperty({ description: 'Temperatura máxima (°C)', example: 24.0, required: false })
  @IsOptional()
  @IsNumber()
  tempMax?: number;

  @ApiProperty({ description: 'Precipitação (mm)', example: 5.2, required: false })
  @IsOptional()
  @IsNumber()
  precipitacao?: number;

  @ApiProperty({ description: 'Probabilidade de chuva (%)', example: 70, required: false })
  @IsOptional()
  @IsNumber()
  probChuva?: number;

  @ApiProperty({ description: 'Velocidade do vento (km/h)', example: 15.5, required: false })
  @IsOptional()
  @IsNumber()
  vento?: number;

  @ApiProperty({ description: 'Humidade relativa (%)', example: 65, required: false })
  @IsOptional()
  @IsNumber()
  humidade?: number;
}

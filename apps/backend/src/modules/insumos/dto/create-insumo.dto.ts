import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateInsumoDto {
  @ApiProperty({ description: 'Nome do insumo', example: 'Adubo NPK 15-15-15' })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Categoria do insumo',
    example: 'FERTILIZANTE',
    enum: ['FERTILIZANTE', 'FITOFARMACO', 'SEMENTE', 'OUTRO']
  })
  @IsString()
  categoria: string;

  @ApiProperty({ description: 'Unidade de medida', example: 'kg' })
  @IsString()
  unidade: string;

  @ApiProperty({ description: 'Quantidade em stock', example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ description: 'Stock mínimo (alerta)', example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimo?: number;

  @ApiProperty({ description: 'Custo unitário (€)', example: 2.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  custoUnit?: number;

  @ApiProperty({ description: 'Data de validade', example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  validade?: string;

  @ApiProperty({ description: 'Número do lote', example: 'LOT2024-001', required: false })
  @IsOptional()
  @IsString()
  lote?: string;
}

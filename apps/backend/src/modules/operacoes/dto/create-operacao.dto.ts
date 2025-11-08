import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateOperacaoDto {
  @ApiProperty({
    description: 'Tipo de operação',
    example: 'PLANTACAO',
    enum: [
      'PLANTACAO',
      'REGA',
      'ADUBACAO',
      'TRATAMENTO',
      'COLHEITA',
      'INSPECAO',
      'PODA',
      'DESBASTE',
    ],
  })
  @IsString()
  tipo: string;

  @ApiProperty({
    description: 'Data da operação',
    example: '2024-11-07T10:00:00Z',
  })
  @IsDateString()
  data: string;

  @ApiProperty({ description: 'Descrição da operação', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ description: 'Notas adicionais', required: false })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiProperty({ description: 'Latitude GPS', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude GPS', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'URLs de fotos',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @ApiProperty({
    description: 'Insumos utilizados',
    required: false,
    example: [{ produto: 'Adubo NPK', dose: 200, unidade: 'kg', custo: 150 }],
  })
  @IsOptional()
  @IsObject()
  insumos?: object;

  @ApiProperty({ description: 'Custo total da operação', required: false })
  @IsOptional()
  @IsNumber()
  custoTotal?: number;

  @ApiProperty({ description: 'ID da parcela' })
  @IsString()
  parcelaId: string;

  @ApiProperty({ description: 'ID do ciclo', required: false })
  @IsOptional()
  @IsString()
  cicloId?: string;

  @ApiProperty({ description: 'ID do operador' })
  @IsString()
  operadorId: string;
}

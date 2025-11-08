import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';

export class ImportTerrenoDto {
  @ApiProperty({ example: 'Terreno Norte' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 12.5, description: 'Área em hectares' })
  @IsNumber()
  area: number;

  @ApiProperty({ description: 'Geometria GeoJSON (Polygon ou MultiPolygon)' })
  @IsObject()
  geometria: any;

  @ApiProperty({ example: 250, required: false })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiProperty({ example: 'Argiloso', required: false })
  @IsOptional()
  @IsString()
  tipoSolo?: string;
}

export class ImportPropriedadeDto {
  @ApiProperty({ example: 'Quinta do Norte' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Propriedade localizada a norte da região', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ type: [ImportTerrenoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTerrenoDto)
  terrenos: ImportTerrenoDto[];
}

export class BulkImportDto {
  @ApiProperty({ example: 'clxxxxxxxx', description: 'ID da organização' })
  @IsString()
  @IsNotEmpty()
  organizacaoId: string;

  @ApiProperty({ type: [ImportPropriedadeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportPropriedadeDto)
  propriedades: ImportPropriedadeDto[];
}

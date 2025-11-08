import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, Min } from 'class-validator';

export class CreateParcelaDto {
  @ApiProperty({ description: 'Nome da parcela' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Área em hectares', example: 2.5 })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({
    description: 'Geometria da parcela em GeoJSON',
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [-6.75, 41.79],
          [-6.748, 41.79],
          [-6.748, 41.792],
          [-6.75, 41.792],
          [-6.75, 41.79],
        ],
      ],
    },
  })
  @IsObject()
  geometria: object;

  @ApiProperty({ description: 'Altitude em metros', required: false })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiProperty({ description: 'Tipo de solo', required: false })
  @IsOptional()
  @IsString()
  tipoSolo?: string;

  @ApiProperty({ description: 'ID da propriedade' })
  @IsString()
  propriedadeId: string;
}

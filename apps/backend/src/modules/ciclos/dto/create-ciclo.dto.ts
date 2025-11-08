import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateCicloDto {
  @ApiProperty({
    description: 'Época do ciclo',
    example: '2024/2025',
  })
  @IsString()
  epoca: string;

  @ApiProperty({
    description: 'Data de início do ciclo',
    example: '2024-09-01',
  })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({
    description: 'Data de fim do ciclo',
    example: '2025-06-30',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiProperty({
    description: 'Estado do ciclo',
    example: 'ATIVO',
    enum: ['ATIVO', 'CONCLUIDO', 'CANCELADO'],
    default: 'ATIVO',
  })
  @IsOptional()
  @IsIn(['ATIVO', 'CONCLUIDO', 'CANCELADO'], {
    message: 'Estado deve ser ATIVO, CONCLUIDO ou CANCELADO',
  })
  estado?: string;

  @ApiProperty({
    description: 'ID da cultura associada ao ciclo',
    example: 'clxyz123abc',
  })
  @IsString()
  culturaId: string;
}

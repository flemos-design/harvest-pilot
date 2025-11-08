import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsObject } from 'class-validator';

export enum TipoTarefa {
  PLANTACAO = 'PLANTACAO',
  COLHEITA = 'COLHEITA',
  TRATAMENTO = 'TRATAMENTO',
  REGA = 'REGA',
  ADUBACAO = 'ADUBACAO',
  PODA = 'PODA',
  INSPECAO = 'INSPECAO',
  OUTRO = 'OUTRO',
}

export enum PrioridadeTarefa {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum EstadoTarefa {
  PLANEADA = 'PLANEADA',
  EM_CURSO = 'EM_CURSO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export class CreateTarefaDto {
  @ApiProperty({ description: 'Título da tarefa', example: 'Poda de Cerejeiras' })
  @IsString()
  titulo: string;

  @ApiProperty({
    description: 'Descrição detalhada',
    example: 'Poda de formação das cerejeiras na parcela norte',
    required: false,
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({
    description: 'Tipo de tarefa',
    enum: TipoTarefa,
    example: TipoTarefa.PODA,
  })
  @IsEnum(TipoTarefa)
  tipo: TipoTarefa;

  @ApiProperty({
    description: 'Prioridade',
    enum: PrioridadeTarefa,
    default: PrioridadeTarefa.MEDIA,
    required: false,
  })
  @IsOptional()
  @IsEnum(PrioridadeTarefa)
  prioridade?: PrioridadeTarefa;

  @ApiProperty({
    description: 'Estado da tarefa',
    enum: EstadoTarefa,
    default: EstadoTarefa.PLANEADA,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoTarefa)
  estado?: EstadoTarefa;

  @ApiProperty({
    description: 'Data de início planeada',
    example: '2024-03-15T09:00:00Z',
  })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({
    description: 'Data de fim planeada',
    example: '2024-03-15T17:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiProperty({
    description: 'Data de conclusão efetiva',
    example: '2024-03-15T16:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dataConclusao?: string;

  @ApiProperty({
    description: 'Janela meteorológica favorável (JSON)',
    example: { score: 85, vento: 12, chuva: 0, temp: 18 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  janelaMeteo?: {
    score?: number;
    vento?: number;
    chuva?: number;
    temp?: number;
  };

  @ApiProperty({
    description: 'ID do responsável pela tarefa',
    example: 'clxxx123',
    required: false,
  })
  @IsOptional()
  @IsString()
  responsavelId?: string;
}

import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ description: 'Pergunta do utilizador' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'ID da parcela (opcional, para contexto)', required: false })
  @IsOptional()
  @IsString()
  parcelaId?: string;

  @ApiProperty({ description: 'ID da organização para contexto' })
  @IsString()
  organizacaoId: string;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'Resposta da IA' })
  answer: string;

  @ApiProperty({ description: 'Fontes de dados usadas para a resposta' })
  sources: string[];

  @ApiProperty({ description: 'Nível de confiança (0-1)', example: 0.85 })
  confidence: number;

  @ApiProperty({ description: 'Explicação do raciocínio', required: false })
  explanation?: string;
}

export class InsightDto {
  @ApiProperty({ description: 'Tipo de insight' })
  type: 'warning' | 'recommendation' | 'alert' | 'info';

  @ApiProperty({ description: 'Título do insight' })
  title: string;

  @ApiProperty({ description: 'Descrição detalhada' })
  description: string;

  @ApiProperty({ description: 'Parcelas afetadas' })
  parcelaIds: string[];

  @ApiProperty({ description: 'Prioridade (1-5, sendo 5 crítica)' })
  priority: number;

  @ApiProperty({ description: 'Ações recomendadas' })
  actions: string[];

  @ApiProperty({ description: 'Explicação do insight' })
  explanation: string;

  @ApiProperty({ description: 'Dados que geraram o insight' })
  dataPoints: Record<string, any>;
}

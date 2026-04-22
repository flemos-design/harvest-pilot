import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificacaoDto {
  @ApiProperty({ description: 'ID do utilizador destinatário' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Tipo de notificação', enum: ['NDVI', 'STOCK', 'METEO', 'TAREFA', 'SISTEMA'] })
  @IsString()
  tipo: string;

  @ApiProperty({ description: 'Título da notificação' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Mensagem detalhada' })
  @IsString()
  mensagem: string;

  @ApiProperty({ description: 'Link opcional para navegação', required: false })
  @IsOptional()
  @IsString()
  link?: string;
}

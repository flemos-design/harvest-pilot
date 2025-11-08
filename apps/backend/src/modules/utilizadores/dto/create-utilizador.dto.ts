import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';

export enum PapelUtilizador {
  ADMIN = 'ADMIN',
  GESTOR = 'GESTOR',
  PLANEADOR = 'PLANEADOR',
  OPERADOR = 'OPERADOR',
}

export class CreateUtilizadorDto {
  @ApiProperty({ description: 'Email do utilizador', example: 'joao.silva@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nome completo do utilizador', example: 'João Silva' })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Password do utilizador (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Papel/Função do utilizador',
    enum: PapelUtilizador,
    default: PapelUtilizador.OPERADOR,
  })
  @IsEnum(PapelUtilizador)
  @IsOptional()
  papel?: PapelUtilizador;

  @ApiProperty({ description: 'ID da organização (opcional - criado automaticamente se não fornecido)', example: 'cuid123...', required: false })
  @IsString()
  @IsOptional()
  organizacaoId?: string;
}

import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperação',
    example: 'abc123xyz456',
  })
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @ApiProperty({
    description: 'Nova password',
    example: 'NovaPassword123!',
    minLength: 6,
  })
  @IsString({ message: 'Password deve ser uma string' })
  @MinLength(6, { message: 'Password deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'Password é obrigatória' })
  newPassword: string;
}

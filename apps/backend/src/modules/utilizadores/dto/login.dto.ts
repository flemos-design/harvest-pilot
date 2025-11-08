import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email do utilizador', example: 'joao.silva@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password do utilizador', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

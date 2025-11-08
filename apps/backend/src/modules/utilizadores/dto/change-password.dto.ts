import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Password atual', example: 'oldpassword123' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ description: 'Nova password', example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

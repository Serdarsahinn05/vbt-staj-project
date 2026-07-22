import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'EskiSifre123!' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'YeniSifre456!' })
  @IsString()
  @MinLength(6, { message: 'Yeni şifre en az 6 karakter olmalıdır.' })
  newPassword: string;
}
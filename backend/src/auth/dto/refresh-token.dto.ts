import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token boş olamaz' })
  @IsString()
  refreshToken: string;
}
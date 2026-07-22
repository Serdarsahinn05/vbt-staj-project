import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth') // Swagger arayüzünde bu uç noktaları "Auth" başlığı altında toplar
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'Kayıt başarılı.' })
  @ApiResponse({ status: 409, description: 'Bu e-posta adresi zaten kullanımda.' })
  async register(@Body() registerDto: RegisterDto) { 
    return this.authService.register(
      registerDto.name, 
      registerDto.email, 
      registerDto.password
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiResponse({ status: 200, description: 'Giriş başarılı, Access ve Refresh token döner.' })
  @ApiResponse({ status: 401, description: 'Geçersiz e-posta veya şifre.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiResponse({ status: 200, description: 'Yeni token başarıyla üretildi.' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş refresh token.' })
  @ApiResponse({ status: 403, description: 'Erişim engellendi.' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
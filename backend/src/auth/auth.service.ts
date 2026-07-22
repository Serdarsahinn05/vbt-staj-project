import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_SECRET || 'gizliAnahtar123', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET || 'gizliRefreshAnahtar123', expiresIn: '7d' },
      ),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  async register(name: string, email: string, pass: string) {
    // 1. E-posta adresi kullanımda mı kontrolü
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi sistemde zaten kayıtlı.');
    }

    // 2. Şifreyi güvenlik için hash'le (Düz metin olarak kaydetmekten kaçınıyoruz)
    const hashedPassword = await bcrypt.hash(pass, 10);

    // 3. Kullanıcıyı oluştur
    const newUser = await this.prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // 4. Şifreyi yanıttan çıkararak güvenliği sağla
    const { password, ...result } = newUser;
    return result;
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('E-posta adresi veya şifre hatalı!');

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('E-posta adresi veya şifre hatalı!');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'gizliRefreshAnahtar123',
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) {
        throw new ForbiddenException('Erişim engellendi');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new ForbiddenException('Erişim engellendi');
      }

      const newTokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshTokenHash(user.id, newTokens.refresh_token);

      return newTokens;
    } catch (e) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token');
    }
  }
}
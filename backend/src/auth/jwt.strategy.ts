import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Token'ı Authorization başlığından (Bearer token olarak) almasını söylüyoruz
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Süresi dolan token'ları reddet
      // .env dosyasındaki JWT şifreni ConfigService ile güvenli bir şekilde okuyoruz
      secretOrKey: configService.get<string>('JWT_SECRET') || 'gizliAnahtar123',
    });
  }

  // Token geçerliyse bu metod çalışır
  async validate(payload: any) {
    // Buradan dönen değer, NestJS tarafından otomatik olarak "req.user" objesine yerleştirilir.
    // Yani giriş yapan kullanıcının ID'sine ve E-postasına diğer dosyalardan kolayca ulaşabileceğiz.
    return { userId: payload.sub, email: payload.email };
  }
}
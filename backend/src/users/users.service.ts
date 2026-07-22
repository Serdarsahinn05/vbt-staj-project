import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Profil Bilgilerini Getir (Şifre Hariç)
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, addresses: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  // 2. Profil Güncelle
  async updateProfile(userId: number, updateData: { name?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true }, // Şifreyi dönmüyoruz
    });
  }

  // 3. Şifre Değiştir
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mevcut şifreniz hatalı.');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Şifreniz başarıyla değiştirildi.' };
  }

  // 4. Adres Ekle
  async addAddress(userId: number, addressData: any) {
    return this.prisma.address.create({
      data: {
        ...addressData,
        userId: userId,
      },
    });
  }

  // 5. Adres Sil
  async deleteAddress(userId: number, addressId: number) {
    // Sadece adresi oluşturan kişi silebilir (Güvenlik)
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!address) throw new NotFoundException('Adres bulunamadı veya yetkiniz yok');

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }
}
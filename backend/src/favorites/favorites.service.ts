import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: { product: { include: { category: true } } },
        },
      },
    });
  }


  async addFavorite(userId: number, variantId: number) {
    try {
      return await this.prisma.favorite.upsert({
        where: { userId_variantId: { userId, variantId } },
        create: { userId, variantId },
        update: {},
        include: {
          variant: {
            include: { product: { include: { category: true } } },
          },
        },
      });
    } catch (e) {

      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('Geçersiz varyant');
      }
      throw e;
    }
  }

  async removeFavorite(userId: number, variantId: number) {
    try {
      return await this.prisma.favorite.delete({
        where: { userId_variantId: { userId, variantId } },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Favori bulunamadı');
      }
      throw e;
    }
  }
}

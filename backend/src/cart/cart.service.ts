import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private effectivePrice(price: Prisma.Decimal | number | string, discount: number): number {
    const base = Number(price);
    const net = base * (1 - (discount ?? 0) / 100);
    return Math.round(net * 100) / 100;
  }

  private async getOrCreateCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) return cart;

    try {
      return await this.prisma.cart.create({ data: { userId } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('Geçersiz kullanıcı');
      }
      throw e;
    }
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    const rows = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { variant: { include: { product: true } } },
    });

    const items = rows.map((item) => {
      const unitPrice = this.effectivePrice(item.variant.price, item.variant.discount);
      return {
        ...item,
        unitPrice,
        lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
      };
    });

    const total = Math.round(
      items.reduce((sum, i) => sum + i.lineTotal, 0) * 100,
    ) / 100;

    return { id: cart.id, userId: cart.userId, items, total };
  }

  async addItem(userId: number, dto: AddItemDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });
    if (!variant) {
      throw new NotFoundException('Varyant bulunamadı');
    }

    const cart = await this.getOrCreateCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: dto.variantId } },
    });

    const quantity = (existing?.quantity ?? 0) + dto.quantity;
    if (quantity > variant.stock) {
      throw new BadRequestException('Yetersiz stok');
    }

    return this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: dto.variantId } },
      create: { cartId: cart.id, variantId: dto.variantId, quantity },
      update: { quantity },
      include: { variant: { include: { product: true } } },
    });
  }

  async updateItem(userId: number, variantId: number, dto: UpdateItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Sepet bulunamadı');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      include: { variant: true },
    });
    if (!item) {
      throw new NotFoundException('Ürün sepette yok');
    }

    if (dto.quantity > item.variant.stock) {
      throw new BadRequestException('Yetersiz stok');
    }

    return this.prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { quantity: dto.quantity },
      include: { variant: { include: { product: true } } },
    });
  }

  async removeItem(userId: number, variantId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Sepet bulunamadı');
    }

    try {
      return await this.prisma.cartItem.delete({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Ürün sepette yok');
      }
      throw e;
    }
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Sepet bulunamadı');
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }
}

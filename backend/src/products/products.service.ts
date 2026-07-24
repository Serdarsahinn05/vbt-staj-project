import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
    
  constructor(private prisma: PrismaService) {}
  

  async findAll(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
    where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
    ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.gender) where.gender = query.gender;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {

    where.variants = {
        some: {
            price: {
                ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
                ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
        },
    };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;


    const orderBy = query.sortBy ? { [query.sortBy]: 'asc' as const } : undefined;


    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { variants: true, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({where: { id }, include: { category: true, variants: true }});
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    const { variants, ...productData } = dto;
    try {
      return await this.prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: variants.map((v) => ({
              colorName: v.colorName,
              colorHex: v.colorHex,
              images: v.images,

              ...(v.price !== undefined ? { price: v.price } : {}),
              ...(v.stock !== undefined ? { stock: v.stock } : {}),
            })),
          },
        },
        include: { variants: true, category: true },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new BadRequestException('Geçersiz Kategori');
      }
      throw e;
    }
  }


  async update(id: number, dto: UpdateProductDto) {

    const { variants, ...productData } = dto;
    try {
      return await this.prisma.product.update({
        where: { id },
        data: productData,
        include: { variants: true, category: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Ürün bulunamadı');
      }
      throw e;
      }
    }




    async delete(id: number) {
  try {
    return await this.prisma.product.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new NotFoundException('Ürün bulunamadı');
    }
    throw e;
  }
  }


  async updateVariant(variantId: number, dto: UpdateVariantDto) {
    try {
      return await this.prisma.productVariant.update({
        where: { id: variantId },
        data: dto,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Varyant bulunamadı');
      }
      throw e;
    }
  }








}

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from '../../generated/prisma/client';
import { UpdateCategoryDto } from "./dto/update-category.dto";


@Injectable()
export class CategoriesService {

  
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany();
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
        },
      });
    }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Bu isimde bir kategori zaten var');
      }
      throw e;
    }
  }


  async update(id: number, dto: UpdateCategoryDto) {
  try {
    return await this.prisma.category.update({
      where: { id },
      data: dto,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new NotFoundException('Kategori bulunamadı');
    }
    throw e;
    }
  }


  async findOne(id: number) {
  const category = await this.prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new NotFoundException('Kategori bulunamadı');
  }
  return category;
}


  async delete(id: number) {
  try {
    return await this.prisma.category.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new NotFoundException('Kategori bulunamadı');
    }
    throw e;
  }
  }
  
  
}

  
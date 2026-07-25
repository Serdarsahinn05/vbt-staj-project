import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}


  async getReviews(productId: number) {
    const [reviews, agg] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return {
      data: reviews,
      average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
      count: agg._count,
    };
  }


  async addReview(userId: number, productId: number, dto: CreateReviewDto) {
    try {
      return await this.prisma.review.create({
        data: { userId, productId, rating: dto.rating, comment: dto.comment },
        include: { user: { select: { id: true, name: true } } },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('Bu ürüne zaten yorum yaptınız');
        }
        if (e.code === 'P2003') {
          throw new BadRequestException('Geçersiz ürün');
        }
      }
      throw e;
    }
  }

  async deleteReview(userId: number, reviewId: number) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Yorum bulunamadı');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('Bu yorumu silme yetkiniz yok');
    }
    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}

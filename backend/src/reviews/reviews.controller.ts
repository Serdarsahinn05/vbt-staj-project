import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('products/:productId/reviews')
  @ApiOperation({ summary: 'Ürünün yorumlarını ve ortalama puanını listeler' })
  getReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getReviews(productId);
  }

  @Post('products/:productId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürüne yorum + puan ekler (giriş gerekli)' })
  addReview(
    @GetUser('userId') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.addReview(userId, productId, body);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kendi yorumunu siler' })
  deleteReview(@GetUser('userId') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(userId, id);
  }
}

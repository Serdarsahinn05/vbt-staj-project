import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının favori varyantlarını listeler' })
  getFavorites(@GetUser('userId') userId: number) {
    return this.favoritesService.getFavorites(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Bir varyantı favorilere ekler' })
  addFavorite(@GetUser('userId') userId: number, @Body() body: AddFavoriteDto) {
    return this.favoritesService.addFavorite(userId, body.variantId);
  }

  @Delete(':variantId')
  @ApiOperation({ summary: 'Bir varyantı favorilerden çıkarır' })
  removeFavorite(
    @GetUser('userId') userId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
  ) {
    return this.favoritesService.removeFavorite(userId, variantId);
  }
}

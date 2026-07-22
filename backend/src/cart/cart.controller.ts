import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Cart') 
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) 
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Sepet başarıyla getirildi.' })
  getCart(@GetUser('userId') userId: number) { 
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiResponse({ status: 201, description: 'Ürün sepete başarıyla eklendi.' })
  addItem(@GetUser('userId') userId: number, @Body() body: AddItemDto) {
    return this.cartService.addItem(userId, body);
  }

  @Patch('items/:productId')
  @ApiResponse({ status: 200, description: 'Ürün başarıyla güncellendi.' })
  updateItem(
    @GetUser('userId') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateItemDto,
  ) {
    return this.cartService.updateItem(userId, productId, body);
  }

  @Delete('items/:productId')
  @ApiResponse({ status: 200, description: 'Ürün sepetten çıkarıldı.' })
  removeItem(
    @GetUser('userId') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ApiResponse({ status: 200, description: 'Sepet temizlendi.' })
  clearCart(@GetUser('userId') userId: number) {
    return this.cartService.clearCart(userId);
  }
}
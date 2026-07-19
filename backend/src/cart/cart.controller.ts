import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('cart')
export class CartController {

    constructor(private cartService: CartService) {}

    @Get()
    getCart(@Query('userId', ParseIntPipe) userId: number) {
    return this.cartService.getCart(userId);
    }


    @Post('items')
    addItem(@Query('userId', ParseIntPipe) userId: number, @Body() body: AddItemDto) {
    return this.cartService.addItem(userId, body);
  }


    @Patch('items/:productId')
    updateItem(
        @Query('userId', ParseIntPipe) userId: number,
        @Param('productId', ParseIntPipe) productId: number,
        @Body() body: UpdateItemDto,
    ) {
        return this.cartService.updateItem(userId, productId, body);
    }

    @Delete('items/:productId')
    removeItem(
        @Query('userId', ParseIntPipe) userId: number,
        @Param('productId', ParseIntPipe) productId: number,
    ) {
        return this.cartService.removeItem(userId, productId);
    }


    @Delete()
    clearCart(@Query('userId', ParseIntPipe) userId: number) {
        return this.cartService.clearCart(userId);
    }





    
}

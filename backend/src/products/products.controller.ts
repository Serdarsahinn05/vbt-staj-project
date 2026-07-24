import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {

    constructor(private productsService: ProductsService) {}

    @Get()
    getAllProducts(@Query() query: ProductQueryDto) {
        return this.productsService.findAll(query);
    }


    @Get(':id')
    getOneProducts(@Param('id', ParseIntPipe) id: number){
        return this.productsService.findOne(id);
    }

    @Post()
    createProduct(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
    }

    @Patch('variants/:variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Varyant stok/fiyat/indirim güncelle (sadece ADMIN)' })
    updateVariant(
        @Param('variantId', ParseIntPipe) variantId: number,
        @Body() body: UpdateVariantDto,
    ) {
        return this.productsService.updateVariant(variantId, body);
    }

    @Patch(':id')
    updateProduct(@Body() body: UpdateProductDto, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.update(id, body);
    }

    @Delete(':id')
    deleteProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(id);
    }





}

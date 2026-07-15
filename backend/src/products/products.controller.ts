import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

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

    @Patch(':id')
    updateProduct(@Body() body: UpdateProductDto, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.update(id, body);
    }

    @Delete(':id')
    deleteProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(id);
    }





}

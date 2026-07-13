import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post  } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {

    constructor(private categoriesService: CategoriesService) {}

    @Get()
    getAllCategories() {
    return this.categoriesService.findAll();
    }

    @Get(':id')
    getOneCategories(@Param('id', ParseIntPipe) id: number){
        return this.categoriesService.findOne(id);
    }

    @Post()
    createCategory(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
    }

    @Patch(':id')
    updateCategory(@Body() body: UpdateCategoryDto, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.update(id, body);
    }

    @Delete(':id')
    deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.delete(id);
    }

}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesProductsService } from './categories-products.service';
import { CreateCategoriesProductDto } from './dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from './dto/update-categories-product.dto';

@Controller('categories-products')
export class CategoriesProductsController {
  constructor(private readonly categoriesProductsService: CategoriesProductsService) {}

  @Post()
  create(@Body() createCategoriesProductDto: CreateCategoriesProductDto) {
    return this.categoriesProductsService.create(createCategoriesProductDto);
  }

  @Get()
  findAll() {
    return this.categoriesProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriesProductDto: UpdateCategoriesProductDto) {
    return this.categoriesProductsService.update(+id, updateCategoriesProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesProductsService.remove(+id);
  }
}

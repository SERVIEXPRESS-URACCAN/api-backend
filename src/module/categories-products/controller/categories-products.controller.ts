import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCategoriesProductDto } from '../dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from '../dto/update-categories-product.dto';
import { CategoriesProductsService } from '../service/categories-products.service';

@Controller('categories-products')
export class CategoriesProductsController {
  constructor(
    private readonly categoriesProductsService: CategoriesProductsService,
  ) {}

  @Post()
  async create(@Body() createCategoriesProducts: CreateCategoriesProductDto) {
    const categoriesProducts = await this.categoriesProductsService.create(
      createCategoriesProducts,
    );
    return {
      data: categoriesProducts,
      message: 'categoriesProducts created successfully',
    };
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
  update(
    @Param('id') id: string,
    @Body() updateCategoriesProductsDto: UpdateCategoriesProductDto,
  ) {
    return this.categoriesProductsService.update(
      +id,
      updateCategoriesProductsDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesProductsService.remove(id);
  }
}

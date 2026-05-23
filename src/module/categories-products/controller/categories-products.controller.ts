import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCategoriesProductDto } from '../dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from '../dto/update-categories-product.dto';
import { CategoriesProductsService } from '../service/categories-products.service';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('categories-products')
export class CategoriesProductsController {
  constructor(
    private readonly categoriesProductsService: CategoriesProductsService,
  ) {}

  @Post()
  @Auth('admin')
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
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriesProductsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesProductsService.findOne(+id);
  }

  @Patch(':id')
  @Auth('admin')
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
  @Auth('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesProductsService.remove(id);
  }
}

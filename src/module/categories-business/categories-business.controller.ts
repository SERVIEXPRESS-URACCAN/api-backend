import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesBusinessService } from './categories-business.service';
import { CreateCategoriesBusinessDto } from './dto/create-categories-business.dto';
import { UpdateCategoriesBusinessDto } from './dto/update-categories-business.dto';

@Controller('categories-business')
export class CategoriesBusinessController {
  constructor(private readonly categoriesBusinessService: CategoriesBusinessService) {}

  @Post()
  create(@Body() createCategoriesBusinessDto: CreateCategoriesBusinessDto) {
    return this.categoriesBusinessService.create(createCategoriesBusinessDto);
  }

  @Get()
  findAll() {
    return this.categoriesBusinessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesBusinessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriesBusinessDto: UpdateCategoriesBusinessDto) {
    return this.categoriesBusinessService.update(+id, updateCategoriesBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesBusinessService.remove(+id);
  }
}

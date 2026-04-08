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
import { CreateCategoriesBusinessDto } from '../dto/create-categories-business.dto';
import { UpdateCategoriesBusinessDto } from '../dto/update-categories-business.dto';
import { CategoriesBusinessService } from '../service/categories-business.service';

@Controller('categories-business')
export class CategoriesBusinessController {
  constructor(
    private readonly categoriesBusinessService: CategoriesBusinessService,
  ) {}

  @Post()
  async create(
    @Body() createcategoriesBusinessDto: CreateCategoriesBusinessDto,
  ) {
    const categoriesBusiness = await this.categoriesBusinessService.create(
      createcategoriesBusinessDto,
    );
    return {
      data: categoriesBusiness,
      message: 'categoriesBusiness created successfully',
    };
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
  update(
    @Param('id') id: string,
    @Body() updateCategoriesBusinessDto: UpdateCategoriesBusinessDto,
  ) {
    return this.categoriesBusinessService.update(
      +id,
      updateCategoriesBusinessDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesBusinessService.remove(id);
  }
}

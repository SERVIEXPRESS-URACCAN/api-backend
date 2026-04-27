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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { CreateCategoriesBusinessDto } from '../dto/create-categories-business.dto';
import { UpdateCategoriesBusinessDto } from '../dto/update-categories-business.dto';
import { CategoriesBusinessService } from '../service/categories-business.service';

@Controller('categories-business')
export class CategoriesBusinessController {
  constructor(
    private readonly categoriesBusinessService: CategoriesBusinessService,
  ) {}

  @Post()
  @Auth('admin')
  async create(
    @Body() createcategoriesBusinessDto: CreateCategoriesBusinessDto,
  ) {
    const categoriesBusiness = await this.categoriesBusinessService.create(
      createcategoriesBusinessDto,
    );
    return {
      data: categoriesBusiness,
      success: true,
    };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriesBusinessService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesBusinessService.findOne(+id);
  }

  @Patch(':id')
  @Auth('admin')
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
  @Auth('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesBusinessService.remove(id);
  }
}

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

import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { MotorcycleBrandsService } from '../service/motorcycle-brands.service';
import { CreateMotorcycleBrandDto } from '../dto/create-motorcycle-brand.dto';
import { UpdateMotorcycleBrandDto } from '../dto/update-motorcycle-brand.dto';

@Controller('motorcycle-brands')
export class MotorcycleBrandsController {
  constructor(
    private readonly motorcycleBrandsService: MotorcycleBrandsService,
  ) {}

  @Get()
  @Auth('client', 'admin')
  findAll() {
    return this.motorcycleBrandsService.findAllBrand();
  }

  @Post()
  @Auth('admin')
  create(@Body() dto: CreateMotorcycleBrandDto) {
    return this.motorcycleBrandsService.create(dto.name);
  }

  @Patch(':id')
  @Auth('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMotorcycleBrandDto,
  ) {
    return this.motorcycleBrandsService.update(id, dto.name);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.motorcycleBrandsService.remove(id);
  }
}

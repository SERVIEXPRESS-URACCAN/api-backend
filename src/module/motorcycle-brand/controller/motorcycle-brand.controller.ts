import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateMotorcycleBrandDto } from '../dto/create-motorcycle-brand.dto';
import { MotorcycleBrandService } from '../service/motorcycle-brand.service';
import { UpdateMotorcycleBrandDto } from '../dto/update-motoecycle-brand.dto';

@Controller('motorcycle-brand')
export class MotorcycleBrandController {
  constructor(
    private readonly motorcycleBrandService: MotorcycleBrandService,
  ) {}

  @Get()
  getAll() {
    return this.motorcycleBrandService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.motorcycleBrandService.getOne(id);
  }

  @Post()
  create(@Body() motorcycleBrandDto: CreateMotorcycleBrandDto) {
    return this.motorcycleBrandService.create(motorcycleBrandDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() motorcycleBrandDto: UpdateMotorcycleBrandDto,
  ) {
    return this.motorcycleBrandService.update(id, motorcycleBrandDto);
  }
}

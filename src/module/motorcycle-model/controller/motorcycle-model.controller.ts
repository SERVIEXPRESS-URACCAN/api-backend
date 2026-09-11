import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateMotorcycleModelDto } from '../dto/create-motorcycle-model.dto';
import { MotorcycleModelService } from '../service/motorcycle-model.service';
import { UpdateMotorcycleModelDto } from '../dto/update-motorcycle-model.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';

@Controller('motorcycle-model')
export class MotorcycleModelController {
  constructor(
    private readonly motorcycleModelService: MotorcycleModelService,
  ) {}

  @Get()
  getAll() {
    return this.motorcycleModelService.getAll();
  }

  @Get('brand/:brandId')
  getByBrand(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.motorcycleModelService.getByBrand(brandId);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.motorcycleModelService.getOne(id);
  }

  @Post()
  @Auth('admin')
  create(@Body() motorcycleModelDto: CreateMotorcycleModelDto) {
    return this.motorcycleModelService.create(motorcycleModelDto);
  }

  @Patch(':id')
  @Auth('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() motorcycleModelDto: UpdateMotorcycleModelDto,
  ) {
    return this.motorcycleModelService.update(id, motorcycleModelDto);
  }
}

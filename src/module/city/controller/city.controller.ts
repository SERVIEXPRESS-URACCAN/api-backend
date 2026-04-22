import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { CityService } from '../service/city.service';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  getAll() {
    return this.cityService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.getOne(id);
  }
  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    const city = await this.cityService.create(createCityDto);
    return {
      data: city,
      message: 'city created successfully',
    };
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatecityDto: UpdateCityDto,
  ) {
    return this.cityService.update(id, updatecityDto);
  }
}

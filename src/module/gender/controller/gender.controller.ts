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
import { GenderService } from '../services/gender.service';
import { CreateGenderDto } from '../dto/create-gender.dto';
import { UpdateGenderDto } from '../dto/update-gender.dto';

@Controller('gender')
export class GenderController {
  constructor(private readonly genderService: GenderService) {}

  @Get()
  getAll() {
    return this.genderService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.genderService.getOne(id);
  }
  @Post()
  async create(@Body() createGenderDto: CreateGenderDto) {
    const gender = await this.genderService.create(createGenderDto);
    return {
      data: gender,
      message: 'Gender created successfully',
    };
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGenderDto: UpdateGenderDto) {
    return this.genderService.update(+id, updateGenderDto);
  }
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.genderService.delete(id);
  }
}

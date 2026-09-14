import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { CreateGenderDto } from '../dto/create-gender.dto';
import { UpdateGenderDto } from '../dto/update-gender.dto';
import { GenderService } from '../services/gender.service';

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
  @Auth('admin')
  async create(@Body() createGenderDto: CreateGenderDto) {
    const gender = await this.genderService.create(createGenderDto);
    return {
      data: gender,
      message: 'Gender created successfully',
    };
  }
  @Patch(':id')
  @Auth('admin')
  update(@Param('id') id: string, @Body() updateGenderDto: UpdateGenderDto) {
    return this.genderService.update(+id, updateGenderDto);
  }
}

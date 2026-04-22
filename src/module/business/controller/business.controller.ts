import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { CreateBusinessDto } from '../dto/create-business.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { BusinessService } from '../service/business.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async create(@Body() createBusinessDto: CreateBusinessDto) {
    const business = await this.businessService.create(createBusinessDto);

    return {
      data: business,
      message: 'Business creado con éxito',
    };
  }

  @Get()
  async findAll() {
    const data = await this.businessService.findAll();

    return {
      data,
      message: 'Listado de negocios',
    };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.businessService.findOne(id);

    return {
      data,
      message: 'Negocio encontrado',
    };
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoImage', maxCount: 1 },
      { name: 'bannerImage', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @UploadedFiles()
    files: {
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    },
  ) {
    const data = await this.businessService.update(
      id,
      updateBusinessDto,
      files,
    );

    return {
      data,
      message: 'Negocio actualizado correctamente',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.businessService.remove(id);

    return {
      data,
      message: 'Negocio eliminado correctamente',
    };
  }
}

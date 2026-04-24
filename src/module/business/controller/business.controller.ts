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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('city') city?: number,
  ) {
    const data = await this.businessService.findAll(paginationDto, city);

    return {
      ...data,
    };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.businessService.findOne(id);

    return {
      data,
    };
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logoImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/business',
          filename: (req, file, cb) => {
            const uniqueName =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${uniqueName}${ext}`);
          },
        }),
      },
    ),
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
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.businessService.remove(id);

    return {
      data,
    };
  }
}

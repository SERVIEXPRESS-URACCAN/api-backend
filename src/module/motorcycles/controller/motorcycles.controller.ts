import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import { CreateMotorcycleDto } from '../dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { MotorcyclesService } from '../service/motorcycles.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

type UploadedFile = {
  path: string;
  mimetype: string;
  size: number;
};
@Controller('motorcycles')
export class MotorcyclesController {
  constructor(private readonly motorcyclesService: MotorcyclesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'circulationImage', maxCount: 1 },
        { name: 'insuranceImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/motorcycles',
          filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
      },
    ),
  )
  create(
    @Body() body: CreateMotorcycleDto,
    @UploadedFiles()
    files: {
      circulationImage?: UploadedFile[];
      insuranceImage?: UploadedFile[];
    },
  ) {
    const circulation = files?.circulationImage?.[0];
    const insurance = files?.insuranceImage?.[0];

    if (!circulation || !insurance) {
      throw new BadRequestException(
        'circulation and insurance images are required',
      );
    }
    const maxSize = 3 * 1024 * 1024;
    if (circulation.size > maxSize || insurance.size > maxSize) {
      throw new BadRequestException('File size must be less than 3MBs');
    }
    const allowdTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (
      !allowdTypes.includes(circulation.mimetype) ||
      !allowdTypes.includes(insurance.mimetype)
    ) {
      throw new BadRequestException(
        'Only JPEG, PNG, and JPG files are allowed',
      );
    }
    return this.motorcyclesService.createWithFiles(body, files);
  }

  @Get()
  findAll() {
    return this.motorcyclesService.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.motorcyclesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMotorcycleDto,
  ) {
    return this.motorcyclesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.motorcyclesService.remove(id);
  }
}

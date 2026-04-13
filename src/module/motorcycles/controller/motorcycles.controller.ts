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
} from '@nestjs/common';

import { CreateMotorcycleDto } from '../dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { MotorcyclesService } from '../service/motorcycles.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { Express } from 'express';

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
          filename: (
            req: Express.Request,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void,
          ) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
      },
    ),
  )
  create(@Body() body: CreateMotorcycleDto, @UploadedFiles() files: any) {
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

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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { OwnerService } from '../service/owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'identificationCardImage', maxCount: 1 }], {
      storage: diskStorage({
        destination: './uploads/owners',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + '-' + Math.random().toString(36).substring(2);

          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @UploadedFiles()
    files: {
      identificationCardImage?: Express.Multer.File[];
    },
    @Body() createOwnerDto: CreateOwnerDto,
  ) {
    const owner = await this.ownerService.create(createOwnerDto, files);

    return {
      data: owner,
      message: 'Owner creado con exito',
    };
  }

  @Get()
  findAll() {
    return this.ownerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ownerService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'identificationCardImage', maxCount: 1 }], {
      storage: diskStorage({
        destination: './uploads/owners',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + '-' + Math.random().toString(36).substring(2);

          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: { identificationCardImage?: Express.Multer.File[] },
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return this.ownerService.update(id, updateOwnerDto, files);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ownerService.remove(id);
  }
}

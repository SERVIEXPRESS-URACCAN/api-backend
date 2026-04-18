import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MandaderoService } from '../service/mandadero.service';
import { CreateMandaderoDto } from '../dto/create-mandadero.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

type UploadedFile = {
  path: string;
  mimetype: string;
  size: number;
};

@Controller('mandadero')
export class MandaderoController {
  constructor(private readonly MandaderoService: MandaderoService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imageIdentification', {
      storage: diskStorage({
        destination: './uploads/mandaderos',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body() body: CreateMandaderoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.MandaderoService.createWithFile(body, file);
  }

  @Patch(':id')
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { available: boolean },
  ) {
    return this.MandaderoService.updateAvailability(id, body.available);
  }

  @Patch(':id/activate')
  activate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.MandaderoService.updateActive(id, body.isActive);
  }

  @Get()
  findAll() {
    return this.MandaderoService.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.MandaderoService.findOne(id);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.MandaderoService.remove(id);
  }

  @Patch(':id/file')
  @UseInterceptors(
    FileInterceptor('imageIdentification', {
      storage: diskStorage({
        destination: './uploads/mandaderos',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  updateFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.MandaderoService.updateFile(id, file);
  }
}

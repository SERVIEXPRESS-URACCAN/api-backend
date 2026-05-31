import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { MandaderoAdminService } from '../../service/MandaderoSolicitud/mandadero-solicitud-admin.service';
import { CreateMandaderoAdminDto } from '../../dto/dto-solicitud/create-mandadero-admin.dto';

@Controller('mandadero')
export class MandaderoAdminController {
  constructor(private readonly mandaderoAdminService: MandaderoAdminService) {}

  @Post('admin')
  @Auth('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageIdentification', maxCount: 1 },
        { name: 'circulationImage', maxCount: 1 },
        { name: 'insuranceImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'imageIdentification') {
              return cb(null, './uploads/mandaderos');
            }
            return cb(null, './uploads/motorcycles');
          },
          filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
      },
    ),
  )
  createAdmin(
    @Body() body: CreateMandaderoAdminDto,
    @UploadedFiles()
    files: {
      imageIdentification?: Express.Multer.File[];
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
  ) {
    return this.mandaderoAdminService.create(body, files);
  }
}

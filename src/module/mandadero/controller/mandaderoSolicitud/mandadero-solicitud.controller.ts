import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

import { CreateMandaderoSolicitudDto } from '../../dto/dto-solicitud/create-solicitud.dto';
import { MandaderoSolicitudService } from '../../service/MandaderoSolicitud/Mandadero-solicitud.service';
import { validateFile } from 'src/common/helper/validationFiles.helper';
@Controller('mandadero')
export class MandaderoSolicitudController {
  constructor(
    private readonly mandaderoSolicitudService: MandaderoSolicitudService,
  ) {}

  @Post('solicitud')
  @Auth('client', 'admin')
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
  createSolicitud(
    @Body() body: CreateMandaderoSolicitudDto,
    @GetUser() user: AuthUser,

    @UploadedFiles()
    files: {
      imageIdentification?: Express.Multer.File[];
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
  ) {
    const imageIdentification = files.imageIdentification?.[0];
    const circulationImage = files.circulationImage?.[0];
    const insuranceImage = files.insuranceImage?.[0];

    validateFile(imageIdentification, 'imageIdentification');
    validateFile(circulationImage, 'circulationImage');
    validateFile(insuranceImage, 'insuranceImage');

    return this.mandaderoSolicitudService.create(body, files, user);
  }
}

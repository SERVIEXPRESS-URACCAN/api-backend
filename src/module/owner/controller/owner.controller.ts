import {
  Body,
  Controller,
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
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { CreateOwnerDto } from '../dto/create-owner.dto';
// import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { OwnerService } from '../service/owner.service';
import { OwnerSolicitudService } from '../service/owner-solicitud.service';
import { OwnerStatusService } from '../service/owner-status.service';

import { OwnerApplicationsPaginationDto } from '../dto/application-owner.dto';
@Controller('owner')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly ownerSolicitudService: OwnerSolicitudService,
    private readonly ownerStatusService: OwnerStatusService,
  ) {}

  @Get()
  @Auth('admin')
  async findAll(@Query() paginationDto: OwnerApplicationsPaginationDto) {
    const data = await this.ownerService.findAll(paginationDto);

    return {
      ...data,
    };
  }

  @Get('me')
  @Auth('owner')
  getMyOwner(@GetUser() user: AuthUser) {
    return this.ownerService.findOne(user.id);
  }

  @Get('application/status')
  @Auth('client', 'owner')
  findMySolicitud(@GetUser() user: AuthUser) {
    return this.ownerSolicitudService.findMySolicitud(user);
  }
  @Get('applications')
  @Auth('admin')
  findAllSolicitudes(@Query() paginationDto: OwnerApplicationsPaginationDto) {
    return this.ownerSolicitudService.findAllSolicitudes(
      paginationDto,
      paginationDto.status,
    );
  }

  @Get(':id')
  @Auth('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ownerService.findOneByAdmin(id);
  }
  @Post('apply')
  @Auth('client', 'mandadero')
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
  createSolicitud(
    @Body() dto: CreateOwnerDto,
    @UploadedFiles()
    files: {
      identificationCardImage?: Express.Multer.File[];
    },
    @GetUser() user: AuthUser,
  ) {
    return this.ownerSolicitudService.create(dto, files, user);
  }
  @Patch(':id/approve')
  @Auth('admin')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.ownerStatusService.approve(id);
  }

  @Patch(':id/reject')
  @Auth('admin')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.ownerStatusService.reject(id);
  }

  @Auth('admin')
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
    @GetUser() user: AuthUser,
  ) {
    const result = await this.ownerService.create(createOwnerDto, user, files);

    return {
      success: true,
      data: result,
    };
  }

  @Patch('me')
  @Auth('owner')
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
  updateOwner(
    @UploadedFiles()
    files: { identificationCardImage?: Express.Multer.File[] },

    @Body() updateOwnerDto: UpdateOwnerDto,

    @GetUser() user: AuthUser,
  ) {
    return this.ownerService.updateMe(user.id, updateOwnerDto, files);
  }

  @Patch(':id')
  @Auth('admin')
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
  update(
    @Param('id', ParseIntPipe) id: number,

    @UploadedFiles()
    files: { identificationCardImage?: Express.Multer.File[] },

    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return this.ownerService.updateByAdmin(id, updateOwnerDto, files);
  }
}

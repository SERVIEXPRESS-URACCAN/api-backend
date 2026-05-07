import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { BusinessService } from '../service/business.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Auth('owner')
  @Get('me')
  getMyBusiness(@GetUser() user: AuthUser) {
    return this.businessService.findOne(user.id);
  }

  @Auth('owner')
  @Patch('me')
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
  async updateMyBusiness(
    @GetUser() user: AuthUser,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @UploadedFiles()
    files: {
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    },
  ) {
    const data = await this.businessService.updateMyBusiness(
      user.id,
      updateBusinessDto,
      files,
    );

    return {
      data,
    };
  }

  @Auth('admin')
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

  @Auth('admin')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.businessService.findOneByAdmin(id);

    return {
      data,
    };
  }

  @Auth('admin')
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
}

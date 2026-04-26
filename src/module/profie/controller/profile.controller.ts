import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CreateProfileAdminDto } from '../dto/profile.dto';
import { ProfileService } from '../service/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @Auth('mandadero', 'owner', 'client')
  getMyProfile(@GetUser() user: AuthUser) {
    return this.profileService.findOne(user.id);
  }

  @Patch('me')
  @Auth('mandadero', 'owner', 'client')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  updateMyProfile(
    @GetUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.profileService.update(user.id, dto, file);
  }
  @Post()
  @Auth('admin')
  create(@Body() dto: CreateProfileAdminDto) {
    return this.profileService.create(dto);
  }

  @Get()
  @Auth('admin')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.profileService.findAll(paginationDto);
  }

  @Get(':id')
  @Auth('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  @Auth('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.profileService.update(id, dto, file);
  }
}

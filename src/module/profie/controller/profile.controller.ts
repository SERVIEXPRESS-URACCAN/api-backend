import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CreateProfileAdminDto } from '../dto/profile.dto';
import { ProfileService } from '../service/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

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
  updateMyProfile(@GetUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(user.id, dto);
  }

  @Post()
  @Auth('admin')
  create(@Body() dto: CreateProfileAdminDto) {
    return this.profileService.create(dto);
  }

  @Get()
  @Auth('admin')
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  @Auth('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  @Auth('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(id, dto);
  }
}

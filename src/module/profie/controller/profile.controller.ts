// client.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateProfileDto } from '../dto/profile.dto';
import { ProfileService } from '../service/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  create(@Body() dto: CreateProfileDto) {
    return this.profileService.create(dto);
  }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(id, dto);
  }
}

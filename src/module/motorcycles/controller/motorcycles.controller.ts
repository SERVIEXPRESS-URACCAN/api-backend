import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { MotorcyclesService } from '../service/motorcycles.service';

import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';

@Controller('motorcycles')
export class MotorcyclesController {
  constructor(private readonly motorcyclesService: MotorcyclesService) {}

  @Get('me')
  @Auth('mandadero')
  findMine(@GetUser() user: AuthUser) {
    return this.motorcyclesService.findMine(user);
  }
  @Patch('me')
  @Auth('mandadero')
  updateMine(@Body() body: UpdateMotorcycleDto, @GetUser() user: AuthUser) {
    return this.motorcyclesService.updateMine(body, user);
  }
  @Get()
  @Auth('admin')
  findAll() {
    return this.motorcyclesService.findAll();
  }
  @Get(':id')
  @Auth('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.motorcyclesService.findOne(id);
  }

  @Patch(':id')
  @Auth('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMotorcycleDto,
  ) {
    return this.motorcyclesService.update(id, body);
  }
}

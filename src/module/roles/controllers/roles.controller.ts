import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRolesDto } from '../dto/create-roles.dto';
import { UpdateRolesDto } from '../dto/update-roles.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  getAll() {
    return this.rolesService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.rolesService.getOne(id);
  }

  @Post()
  async create(@Body() createRolesDto: CreateRolesDto) {
    return this.rolesService.create(createRolesDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolesDto: UpdateRolesDto,
  ) {
    return this.rolesService.update(id, updateRolesDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}

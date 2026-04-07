import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRolesDto } from '../dto/create-roles.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  getAll() {
    return this.rolesService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.rolesService.getOne(id);
  }

  @Post()
  async create(@Body() createRolesDto: CreateRolesDto) {
    return this.rolesService.create(createRolesDto);
  }
}

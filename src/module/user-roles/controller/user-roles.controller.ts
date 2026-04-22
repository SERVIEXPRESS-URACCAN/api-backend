import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssignRoleDto } from '../dto/user-roles.dto';
import { UserRolesService } from '../service/user-roles.service';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  assignRole(@Body() dto: AssignRoleDto) {
    return this.userRolesService.assignRole(dto);
  }
  @Get(':userId/:roleId')
  findOne(@Param('userId') userId: number, @Param('roleId') roleId: number) {
    return this.userRolesService.findOne(userId, roleId);
  }
  @Get()
  findAll() {
    return this.userRolesService.findAll();
  }
}

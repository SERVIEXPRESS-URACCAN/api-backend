import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
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

  @Delete(':userId/:roleId')
  async removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userRolesService.removeRole({ userId, roleId });
  }
  @Get(':userId')
  async getRolesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userRolesService.getRolesByUser(userId);
  }
}

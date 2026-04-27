import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AssignRoleDto } from '../dto/user-roles.dto';
import { UserRolesService } from '../service/user-roles.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @Auth('admin')
  assignRole(@Body() dto: AssignRoleDto) {
    return this.userRolesService.assignRole(dto);
  }
  @Get('by-user/:userId/:roleId')
  @Auth('admin')
  findOne(@Param('userId') userId: number, @Param('roleId') roleId: number) {
    return this.userRolesService.findOne(userId, roleId);
  }
  @Get()
  @Auth('admin')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userRolesService.findAll(paginationDto);
  }

  @Delete(':userId/:roleId')
  @Auth('admin')
  async removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userRolesService.removeRole({ userId, roleId });
  }
  @Get(':userId')
  @Auth('admin')
  async getRolesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userRolesService.getRolesByUser(userId);
  }
}

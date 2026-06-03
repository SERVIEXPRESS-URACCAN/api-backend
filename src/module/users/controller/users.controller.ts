import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../service/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Auth('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @Auth()
  findMe(@GetUser() user: AuthUser) {
    return this.usersService.findOne(user.id);
  }

  @Get('available-for-owner')
  findAvailableForOwner() {
    return this.usersService.findAvailableForOwner();
  }

  @Delete('me')
  @Auth()
  removeMe(@GetUser() user: AuthUser) {
    return this.usersService.remove(user.id);
  }

  @Get()
  @Auth('admin')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @Auth('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateUserDto) {
    return this.usersService.restoreUserGraph(id, dto);
  }

  @Patch(':id')
  @Auth('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

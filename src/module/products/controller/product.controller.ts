import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/porducts.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { ProductService } from '../service/products.service';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductService) {}

  @Post()
  @Auth('owner')
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: AuthUser,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Auth('owner')
  findAll(@GetUser() user: AuthUser) {
    return this.productsService.findAllByOwner(user);
  }

  @Get(':id')
  @Auth('owner')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.productsService.findOne(id, user);
  }

  @Get('admin')
  @Auth('admin')
  findAllByAdmin() {
    return this.productsService.findAllByAdmin();
  }

  @Get('admin/:id')
  @Auth('admin')
  findOneByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneByAdmin(id);
  }

  @Post('admin')
  @Auth('admin')
  createByAdmin(@Body() createProductAdminDto: CreateProductAdmin) {
    return this.productsService.createByAdmin(createProductAdminDto);
  }
}

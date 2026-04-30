import { Body, Controller, Post } from '@nestjs/common';
import { CreateProductDto } from '../dto/porducts.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { ProductService } from '../service/products.service';

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
}

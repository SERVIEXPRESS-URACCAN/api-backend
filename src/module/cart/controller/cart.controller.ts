import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { GetOrCreateCartDto } from '../dto/get-or-create-cart.dto';
import { CartService } from '../service/cart.service';

@Auth('client')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('my-carts')
  getMyCarts(@GetUser() user: AuthUser) {
    return this.cartService.getUserCarts(user.id);
  }

  @Get()
  getOrCreateCart(@Query() dto: GetOrCreateCartDto, @GetUser() user: AuthUser) {
    return this.cartService.getOrCreateCart(user.id, dto.businessId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.cartService.findOne(id, user.id);
  }

  @Patch(':id/checkout')
  checkout(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.cartService.checkoutCart(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.cartService.deleteCart(id, user.id);
  }
}

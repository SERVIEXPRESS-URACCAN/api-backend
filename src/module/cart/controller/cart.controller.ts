import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { GetOrCreateCartDto } from '../dto/get-or-create-cart.dto';
import { CartService } from '../service/cart.service';

@Auth('client')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getOrCreateCart(@Query() dto: GetOrCreateCartDto, @GetUser() user: AuthUser) {
    return this.cartService.getOrCreateCart(user.id, dto.businessId);
  }

  // @Patch(':id/checkout')
  // checkout(@Param('id') id: number) {
  //   return this.cartService.checkoutCart(id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.cartService.deleteCart(id);
  // }
}

import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartItemsService } from '../service/cart-items.service';

@Auth('client')
@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemService: CartItemsService) {}

  @Post()
  addItem(@Body() dto: AddCartItemDto, @GetUser() user: AuthUser) {
    return this.cartItemService.addItem(user.id, dto);
  }

  @Patch(':id')
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @GetUser() user: AuthUser,
  ) {
    return this.cartItemService.updateQuantity(id, user.id, dto.quantity);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.cartItemService.remove(id, user.id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

import { OrderStatus } from '../enum/orderStatus';
import { OrderService } from '../service/order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getMyOrders(@GetUser() user: AuthUser) {
    return this.orderService.getMyOrders(user.id);
  }

  @Get(':id')
  getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AuthUser,
  ) {
    return this.orderService.getOrderById(id, user.id);
  }

  @Post('checkout/:cartId')
  checkout(
    @Param('cartId', ParseIntPipe) cartId: number,
    @GetUser() user: AuthUser,
  ) {
    return this.orderService.createOrderFromCart(user.id, cartId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
    @GetUser() user: AuthUser,
  ) {
    return this.orderService.updateStatus(id, status, user);
  }
}

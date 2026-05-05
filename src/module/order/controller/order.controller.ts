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

import { DeliveryStatus, OrderStatus } from '../enum/orderStatus';
import { OrderService } from '../service/order.service';

import { Auth } from 'src/module/auth/decorator/auth.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Auth('client')
  getMyOrders(@GetUser() user: AuthUser) {
    return this.orderService.getMyOrders(user.id);
  }

  @Get('business')
  @Auth('owner')
  getBusinessOrders(@GetUser() user: AuthUser) {
    return this.orderService.getBusinessOrders(user.id);
  }
  @Get('available')
  @Auth('mandadero')
  getAvailableOrders() {
    return this.orderService.getAvailableOrders();
  }

  @Get(':id')
  @Auth('client', 'owner')
  getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AuthUser,
  ) {
    return this.orderService.getOrderById(id, user.id);
  }

  @Post('checkout/:cartId')
  @Auth('client')
  checkout(
    @Param('cartId', ParseIntPipe) cartId: number,
    @GetUser() user: AuthUser,
  ) {
    console.log('USER DEBUG:', user);
    return this.orderService.createOrderFromCart(user.id, cartId);
  }

  @Patch(':id/status')
  @Auth('owner', 'client')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
    @GetUser() user: AuthUser,
  ) {
    console.log(user.roles);
    return this.orderService.updateStatus(id, status, user);
  }

  @Patch(':id/accept')
  @Auth('mandadero')
  acceptOrder(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AuthUser,
  ) {
    return this.orderService.acceptOrderMandadero(id, user);
  }

  @Patch(':id/delivery-status')
  @Auth('mandadero')
  updateDeliveryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: DeliveryStatus,
    @GetUser() user: AuthUser,
  ) {
    return this.orderService.updateDeliveryStatus(id, status, user);
  }
}

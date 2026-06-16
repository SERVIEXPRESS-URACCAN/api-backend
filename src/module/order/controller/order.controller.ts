import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

import { DeliveryStatus, OrderStatus } from '../enum/orderStatus';
import { OrderService } from '../service/order.service';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetBusinessOrderDto } from '../dto/getBusinessOrder.dto';
import { GetMandaderoOrdersDto } from '../dto/getMandaderoOrders.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('admin/all')
  @Auth('admin')
  getAllOrders(@Query() paginationDto: PaginationDto) {
    return this.orderService.getAllOrders(paginationDto);
  }

  @Get()
  @Auth('client')
  getMyOrders(
    @GetUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.orderService.getMyOrders(user.id, paginationDto);
  }

  @Get('business')
  @Auth('owner')
  getBusinessOrders(
    @GetUser() user: AuthUser,
    @Query() query: GetBusinessOrderDto,
  ) {
    return this.orderService.getBusinessOrders(user.id, query);
  }
  @Get('available')
  @Auth('mandadero')
  getAvailableOrders(@Query() paginationDto: PaginationDto) {
    return this.orderService.getAvailableOrders(paginationDto);
  }

  @Get('my-orders')
  @Auth('mandadero')
  getMandaderoOrders(
    @GetUser() user: AuthUser,
    @Query() query: GetMandaderoOrdersDto,
  ) {
    return this.orderService.getMandaderoOrders(user.id, query);
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

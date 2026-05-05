import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { OrderItemsService } from '../service/order-items.service';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  @Auth('client', 'owner')
  getByOrder(
    @Query('orderId', ParseIntPipe) orderId: number,
    @GetUser() user: AuthUser,
  ) {
    return this.orderItemsService.findByOrder(orderId, user);
  }

  @Get(':id')
  @Auth('client', 'owner')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.orderItemsService.findOne(id, user);
  }
}

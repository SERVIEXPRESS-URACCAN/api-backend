import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrderController } from './controller/order.controller';
import { Order } from './entities/order.entity';
import { OrderService } from './service/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Cart])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

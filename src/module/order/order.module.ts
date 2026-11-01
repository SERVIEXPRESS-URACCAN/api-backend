import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrderController } from './controller/order.controller';
import { Order } from './entities/order.entity';
import { OrderService } from './service/order.service';
import { BusinessModule } from '../business/business.module';
import { Business } from '../business/entities/business.entity';
import { OrderCreationService } from './service/orderCreation.service';
import { StatusUpdateService } from './service/orderUpdate.service';
import { DeliveryService } from './service/delivery.service';
import { Mandadero } from '../mandadero/entities/mandadero.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Cart, Business, Mandadero]),
    BusinessModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderCreationService,
    StatusUpdateService,
    DeliveryService,
  ],
})
export class OrderModule {}

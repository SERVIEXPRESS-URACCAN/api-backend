import { Module } from '@nestjs/common';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/module/users/entities/user.entity';
import { Order } from 'src/module/order/entities/order.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { Product } from 'src/module/products/entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Business, Product])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

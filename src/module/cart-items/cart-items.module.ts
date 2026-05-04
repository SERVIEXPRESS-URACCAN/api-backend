import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { Cart } from '../cart/entities/cart.entity';
import { ProductsModule } from '../products/products.module';
import { CartItemsController } from './controller/cart-items.controller';
import { CartItem } from './entities/cart-item.entity';
import { CartItemsService } from './service/cart-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Cart]),
    ProductsModule,
    CartModule,
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}

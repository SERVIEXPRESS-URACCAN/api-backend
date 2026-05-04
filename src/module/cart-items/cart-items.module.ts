import { Module } from '@nestjs/common';
import { CartItemsController } from './controller/cart-items.controller';
import { CartItemsService } from './service/cart-items.service';

@Module({
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}

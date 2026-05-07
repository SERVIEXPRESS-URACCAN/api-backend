import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './controller/cart.controller';
import { Cart } from './entities/cart.entity';
import { CartService } from './service/cart.service';
import { CartCleanService } from './service/cart-clean.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  controllers: [CartController],
  providers: [CartService, CartCleanService],
  exports: [CartService],
})
export class CartModule {}

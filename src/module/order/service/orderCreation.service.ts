import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart } from 'src/module/cart/entities/cart.entity';
import { CartStatus } from 'src/module/cart/enum/cart-status.enum';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum/orderStatus';
import { OrderItem } from 'src/module/order-items/entities/order-item.entity';

@Injectable()
export class OrderCreationService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrderFromCart(userId: number, cartId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: cartId, userId },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      if (cart.status !== CartStatus.ACTIVE) {
        throw new BadRequestException('Cart is not active');
      }

      if (!cart.items.length) {
        throw new BadRequestException('Cart is empty');
      }

      const order = queryRunner.manager.create(Order, {
        userId,
        businessId: cart.businessId,
        status: OrderStatus.PENDING,
        total: 0,
      });

      const savedOrder = await queryRunner.manager.save(order);

      let total = 0;

      const orderItems = cart.items.map((item) => {
        if (!item.product) {
          throw new NotFoundException('Product not found in cart item');
        }
        const product = item.product;

        const price = Number(product.price);
        const subtotal = price * item.quantity;

        total += subtotal;

        return queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          productId: item.productId,
          nameSnapshot: product.name,
          priceAtMoment: price,
          quantity: item.quantity,
          subtotal,
        });
      });

      await queryRunner.manager.save(OrderItem, orderItems);

      savedOrder.total = total;
      await queryRunner.manager.save(savedOrder);

      cart.status = CartStatus.CHECKED_OUT;
      await queryRunner.manager.save(cart);

      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

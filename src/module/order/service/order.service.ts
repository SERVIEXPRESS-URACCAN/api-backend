import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Cart } from 'src/module/cart/entities/cart.entity';
import { CartStatus } from 'src/module/cart/enum/cart-status.enum';

import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { OrderItem } from 'src/module/order-items/entities/order-item.entity';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum/orderStatus';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

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
        const product = item.product;

        if (!product) {
          throw new NotFoundException('Product not found in cart item');
        }

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

  async getMyOrders(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: number, status: OrderStatus, user: AuthUser) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isBusiness = user.roles === 'business';
    const isClient = user.roles === 'client';

    if (isClient && status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('Clients can only cancel orders');
    }

    if (isBusiness) {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
        ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
        READY: [OrderStatus.ON_THE_WAY],
        ON_THE_WAY: [OrderStatus.DELIVERED],
        DELIVERED: [],
        CANCELLED: [],
      };

      const allowed = validTransitions[order.status] || [];

      if (!allowed.includes(status)) {
        throw new BadRequestException(
          `Cannot change from ${order.status} to ${status}`,
        );
      }
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}

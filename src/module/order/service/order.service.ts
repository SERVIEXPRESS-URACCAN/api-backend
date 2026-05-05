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
import { DeliveryStatus, OrderStatus } from '../enum/orderStatus';
import { Business } from 'src/module/business/entities/business.entity';

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

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
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
  async getBusinessOrders(userId: number) {
    const business = await this.businessRepository.findOne({
      where: {
        owner: {
          user: { id: userId },
        },
      },
      relations: ['owner', 'owner.user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.orderRepository.find({
      where: { businessId: business.id },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(orderId: number, status: OrderStatus, user: AuthUser) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isOwner = user.roles.includes('owner');
    const isClient = user.roles.includes('client');

    if (isOwner) {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
        ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
        READY: [],
        CANCELLED: [],
      };

      const allowed = validTransitions[order.status] || [];

      if (!allowed.includes(status)) {
        throw new BadRequestException(
          `Cannot change from ${order.status} to ${status}`,
        );
      }

      order.status = status;
      return this.orderRepository.save(order);
    }

    if (isClient && status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('Clients can only cancel orders');
    }

    order.status = status;
    return this.orderRepository.save(order);

    throw new BadRequestException('Invalid user role for status update');
  }

  async acceptOrderMandadero(orderId: number, user: AuthUser) {
    const isMandadero = user.roles.includes('mandadero');

    if (!isMandadero) {
      throw new BadRequestException('Only delivery users can accept orders');
    }

    const result = await this.orderRepository.update(
      {
        id: orderId,
        deliveryStatus: DeliveryStatus.WAITING,
      },
      {
        deliveryStatus: DeliveryStatus.ASSIGNED,
        mandaderoId: user.id,
      },
    );

    if (result.affected === 0) {
      throw new BadRequestException('Order already taken');
    }

    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mandadero'],
    });
  }

  async updateDeliveryStatus(
    orderId: number,
    status: DeliveryStatus,
    user: AuthUser,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isMandadero = user.roles.includes('mandadero');

    if (!isMandadero) {
      throw new BadRequestException('Only delivery can update delivery status');
    }

    if (order.mandaderoId !== user.id) {
      throw new BadRequestException('You are not assigned to this order');
    }

    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      WAITING: [DeliveryStatus.ASSIGNED],
      ASSIGNED: [DeliveryStatus.PICKED_UP],
      PICKED_UP: [DeliveryStatus.ON_THE_WAY],
      ON_THE_WAY: [DeliveryStatus.DELIVERED],
      DELIVERED: [],
    };
    const allowed = validTransitions[order.deliveryStatus];

    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot change from ${order.deliveryStatus} to ${status}`,
      );
    }

    order.deliveryStatus = status;
    return this.orderRepository.save(order);
  }

  async getAvailableOrders() {
    return this.orderRepository.find({
      where: {
        status: OrderStatus.READY,
        deliveryStatus: DeliveryStatus.WAITING,
      },
      relations: ['items', 'items.product', 'business'],
    });
  }
}

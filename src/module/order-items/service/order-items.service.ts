import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findByOrder(orderId: number, user: AuthUser) {
    const isClient = user.roles.includes('client');
    const isOwner = user.roles.includes('owner');

    if (isClient && !isOwner) {
      return this.orderItemRepository.find({
        where: { orderId, order: { userId: user.id } },
        relations: ['product', 'order'],
      });
    }
    if (isOwner) {
      return this.orderItemRepository.find({
        where: { orderId, order: { business: { owner: { id: user.id } } } },
        relations: ['product', 'order'],
      });
    }

    throw new ForbiddenException('You cannot access these order items');
  }

  async findOne(id: number, user: AuthUser) {
    const item = await this.orderItemRepository.findOne({
      where: { id },
      relations: ['product', 'order'],
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }
    const isClient = user.roles.includes('client');
    const isOwner = user.roles.includes('owner');

    if (isClient && item.order.userId !== user.id) {
      throw new ForbiddenException('You cannot access this order item');
    }

    if (isOwner && item.order.business?.owner?.id !== user.id) {
      throw new ForbiddenException('You cannot access this order item');
    }
    return item;
  }
}

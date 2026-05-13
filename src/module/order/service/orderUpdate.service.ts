import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { DeliveryStatus, OrderStatus } from '../enum/orderStatus';

@Injectable()
export class StatusUpdateService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}
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
      if (status === OrderStatus.ACCEPTED) {
        order.acceptedAt = new Date();
      }
      order.status = status;
      return this.orderRepository.save(order);
    }

    if (isClient) {
      if (status !== OrderStatus.CANCELLED) {
        throw new BadRequestException('Clients can only cancel orders');
      }
      if (
        [
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.CANCELLED,
        ].includes(order.status)
      ) {
        throw new BadRequestException('This order can no longer be cancelled');
      }
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.CANCELLED;
        order.deliveryStatus = DeliveryStatus.WAITING;

        await this.orderRepository.save(order);

        return {
          message: 'Order cancelled successfully',
          data: order,
        };
      }
      if (order.status === OrderStatus.ACCEPTED) {
        if (!order.acceptedAt) {
          throw new BadRequestException(
            'Order acceptance timestamp is missing',
          );
        }

        const now = new Date();

        const diffInMs = now.getTime() - new Date(order.acceptedAt).getTime();
        const diffInMinutes = diffInMs / (1000 * 60);

        if (diffInMinutes > 5) {
          throw new BadRequestException('The cancellation window has expired');
        }

        order.status = OrderStatus.CANCELLED;

        order.deliveryStatus = DeliveryStatus.WAITING;

        await this.orderRepository.save(order);

        return {
          message: 'Order cancelled successfully',
          data: order,
        };
      }
      throw new BadRequestException('Invalid user role for status update');
    }
  }
}

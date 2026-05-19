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
export class DeliveryService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async acceptOrderMandadero(orderId: number, user: AuthUser) {
    const isMandadero = user.roles.includes('mandadero');

    if (!isMandadero) {
      throw new BadRequestException('Only delivery users can accept orders');
    }

    const result = await this.orderRepository.update(
      {
        id: orderId,
        deliveryStatus: DeliveryStatus.WAITING,
        status: OrderStatus.READY,
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

    if (order.deliveryStatus === DeliveryStatus.WAITING) {
      throw new BadRequestException('Order has not been assigned yet');
    }

    if (!order.mandaderoId) {
      throw new BadRequestException('Order has no delivery person assigned');
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { Business } from 'src/module/business/entities/business.entity';
import { GetBusinessOrderDto } from '../dto/getBusinessOrder.dto';
import { GetMandaderoOrdersDto } from '../dto/getMandaderoOrders.dto';
import { Order } from '../entities/order.entity';
import { DeliveryStatus, OrderStatus } from '../enum/orderStatus';

import { DeliveryService } from './delivery.service';
import { OrderCreationService } from './orderCreation.service';
import { StatusUpdateService } from './orderUpdate.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderCreationService: OrderCreationService,
    private readonly orderUpdateService: StatusUpdateService,
    private readonly deliveryService: DeliveryService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async getAllOrders(paginationDto: PaginationDto & {}) {
    const { page = 1, limit = 10, search } = paginationDto;

    const safeLimit = Math.min(limit, 50);
    const qb = this.orderRepository.createQueryBuilder('order');

    qb.leftJoinAndSelect('order.user', 'user');
    qb.leftJoinAndSelect('user.profile', 'profile');
    qb.leftJoinAndSelect('order.business', 'business');

    if (search) {
      qb.andWhere(
        `
      CAST(order.id AS TEXT) ILIKE :search
      OR profile.name ILIKE :search
      OR user.email ILIKE :search
      OR business.name ILIKE :search
      `,
        { search: `%${search}%` },
      );
    }

    qb.orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [orders, total] = await qb.getManyAndCount();
    return {
      data: orders,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: page * safeLimit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async createOrderFromCart(userId: number, cartId: number) {
    return this.orderCreationService.createOrderFromCart(userId, cartId);
  }

  async getMyOrders(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safeLimit = Math.min(limit, 50);

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      take: safeLimit,
      skip: (page - 1) * safeLimit,
      relations: ['items', 'items.product'],
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: page * safeLimit < total,
        hasPreviousPage: page > 1,
      },
    };
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

  async getBusinessOrderById(orderId: number, userId: number) {
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

    const order = await this.orderRepository.findOne({
      where: { id: orderId, businessId: business.id },
      relations: [
        'user',
        'user.profile',
        'business',
        'items',
        'items.product',
        'mandadero',
        'mandadero.profile',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getBusinessOrders(userId: number, query: GetBusinessOrderDto) {
    const { page = 1, limit = 10, status, search } = query;

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

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.business', 'business')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('order.businessId = :businessId', { businessId: business.id });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        `
      CAST(order.id AS TEXT) ILIKE :search
      OR profile.name ILIKE :search
      OR user.email ILIKE :search
      `,
        { search: `%${search}%` },
      );
    }
    qb.orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [orders, total] = await qb.getManyAndCount();

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getOrderByIdAdmin(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'user',
        'user.profile',
        'business',
        'items',
        'items.product',
        'mandadero',
        'mandadero.profile',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: number, status: OrderStatus, user: AuthUser) {
    return this.orderUpdateService.updateStatus(orderId, status, user);
  }

  async acceptOrderMandadero(orderId: number, user: AuthUser) {
    return this.deliveryService.acceptOrderMandadero(orderId, user);
  }
  async updateDeliveryStatus(
    orderId: number,
    status: DeliveryStatus,
    user: AuthUser,
  ) {
    return this.deliveryService.updateDeliveryStatus(orderId, status, user);
  }

  async getAvailableOrders(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: {
        status: OrderStatus.READY,
        deliveryStatus: DeliveryStatus.WAITING,
      },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['items', 'items.product', 'business'],
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getMandaderoOrders(mandaderoId: number, query: GetMandaderoOrdersDto) {
    const { page = 1, limit = 10, status } = query;

    const where: FindOptionsWhere<Order> = {
      mandaderoId,
    };

    if (status) {
      where.deliveryStatus = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['items', 'items.product', 'business'],
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}

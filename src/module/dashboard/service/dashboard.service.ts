import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from 'src/module/business/entities/business.entity';
import { Order } from 'src/module/order/entities/order.entity';
import { Product } from 'src/module/products/entities/products.entity';
import { User } from 'src/module/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAdminStats() {
    const [users, orders, businesses] = await Promise.all([
      this.userRepository.count(),
      this.orderRepository.count(),
      this.businessRepository.count(),
    ]);

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'total')
      .where('order.deliveryStatus = :status', {
        status: 'DELIVERED',
      })
      .getRawOne<{ total: string }>();

    return {
      users,
      orders,
      businesses,
      revenue: Number(revenueResult?.total ?? 0),
    };
  }

  async getOwnerStats(userId: number) {
    const business = await this.businessRepository
      .createQueryBuilder('business')
      .innerJoin('business.owner', 'owner')
      .innerJoin('owner.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!business) {
      return {
        products: 0,
        orders: 0,
        businesses: 0,
        revenue: 0,
      };
    }

    const products = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.business', 'business')
      .where('business.id = :businessId', { businessId: business.id })
      .getCount();

    const orders = await this.orderRepository.count({
      where: {
        businessId: business.id,
      },
    });

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'total')
      .where('order.businessId = :businessId', { businessId: business.id })
      .andWhere('order.deliveryStatus = :status', { status: 'DELIVERED' })
      .getRawOne<{ total: string }>();

    return {
      products,
      orders,
      businesses: 1,
      revenue: Number(revenueResult?.total ?? 0),
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartStatus } from '../enum/cart-status.enum';

@Injectable()
export class CartCleanService {
  private readonly logger = new Logger(CartCleanService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async deleteExpiredCarts() {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 1);

    await this.cartRepository.delete({
      status: CartStatus.ACTIVE,
      updatedAt: LessThan(expirationDate),
    });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartStatus } from '../enum/cart-status.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async getOrCreateCart(userId: number, businessId: number) {
    let cart = await this.cartRepository.findOne({
      where: {
        userId,
        businessId,
        status: CartStatus.ACTIVE,
      },
    });

    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        businessId,
      });

      await this.cartRepository.save(cart);
    }

    return cart;
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(cartId: number, userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.userId !== userId) {
      throw new ForbiddenException('You do not own this cart');
    }

    return cart;
  }

  async checkoutCart(cartId: number, userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.userId !== userId) {
      throw new ForbiddenException('You do not own this cart');
    }

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException('Cart is not active');
    }

    cart.status = CartStatus.CHECKED_OUT;

    return this.cartRepository.save(cart);
  }

  async deleteCart(cartId: number, userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.userId !== userId) {
      throw new ForbiddenException('You do not own this cart');
    }

    return this.cartRepository.remove(cart);
  }
}

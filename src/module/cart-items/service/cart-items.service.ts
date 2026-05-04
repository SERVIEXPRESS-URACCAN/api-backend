import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/module/cart/entities/cart.entity';
import { CartService } from 'src/module/cart/service/cart.service';
import { ProductSharedService } from 'src/module/products/service/productsShared.service';
import { Repository } from 'typeorm';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    private readonly productSharedService: ProductSharedService,
    private readonly cartService: CartService,
  ) {}

  async addItem(userId: number, dto: AddCartItemDto) {
    const { productId, quantity } = dto;

    const product = await this.productSharedService.findProduct(productId);

    const cart = await this.cartService.getOrCreateCart(
      userId,
      product.business.id,
    );

    let item = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    return this.cartItemRepository.save(item);
  }

  async updateQuantity(itemId: number, userId: number, quantity: number) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.cart.userId !== userId) {
      throw new ForbiddenException('You do not own this cart');
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    item.quantity = quantity;

    return this.cartItemRepository.save(item);
  }

  async remove(itemId: number, userId: number) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.cart.userId !== userId) {
      throw new ForbiddenException('You do not own this cart');
    }

    await this.cartItemRepository.remove(item);

    return {
      message: 'Item removed successfully',
    };
  }
}

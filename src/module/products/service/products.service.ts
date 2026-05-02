import { CreateProductDto } from '../dto/porducts.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/module/business/entities/business.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { ProductSharedService } from './productsShared.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CategoriesProduct)
    private readonly categoryRepository: Repository<CategoriesProduct>,
  ) {}

  async findAllByOwner(user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.productRepository.find({
      where: {
        business: {
          id: business.id,
        },
      },
      relations: {
        category: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        status: true,

        category: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findOne(id: number, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productRepository.findOne({
      where: {
        id,
        business: {
          id: business.id,
        },
      },
      relations: {
        category: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        status: true,
        category: {
          id: true,
          name: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.productSharedService.createProduct(dto, business);
  }
  async update(id: number, updateProductDto: UpdateProductDto, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productRepository.findOne({
      where: {
        id,
        business: {
          id: business.id,
        },
      },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      product.category = category;
    }

    const updatedProduct = {
      ...product,
      ...updateProductDto,
      price: updateProductDto.price
        ? updateProductDto.price.toString()
        : product.price,
    };
    if (!product) throw new NotFoundException('Product not found');
    return this.productRepository.save(updatedProduct);
  }

  async removeByOwner(id: number, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productRepository.findOne({
      where: {
        id,
        business: {
          id: business.id,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.remove(product);

    return { message: 'Product deleted successfully' };
  }
}

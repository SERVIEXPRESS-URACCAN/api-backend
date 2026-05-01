import { CreateProductDto } from '../dto/porducts.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/module/business/entities/business.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

  async findAllByAdmin() {
    return this.productRepository.find({
      relations: {
        business: true,
        category: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        status: true,
        business: {
          id: true,
          name: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findOneByAdmin(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        business: true,
        category: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        status: true,
        business: {
          id: true,
          name: true,
        },
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
  async create(createProductDto: CreateProductDto, user: AuthUser) {
    const { categoryId, ...data } = createProductDto;

    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({
      ...data,
      price: data.price.toString(),
      business,
      category,
    });

    return await this.productRepository.save(product);
  }

  async createByAdmin(createProductAdminDto: CreateProductAdmin) {
    const { businessId, categoryId, ...data } = createProductAdminDto;

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({
      ...data,
      price: data.price.toString(),
      business,
      category,
    });

    return await this.productRepository.save(product);
  }
}

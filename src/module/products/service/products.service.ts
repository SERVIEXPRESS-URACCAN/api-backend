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

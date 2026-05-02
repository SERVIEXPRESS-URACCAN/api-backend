import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/products.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Business } from 'src/module/business/entities/business.entity';
import { CreateProductDto } from '../dto/porducts.dto';

@Injectable()
export class ProductSharedService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(CategoriesProduct)
    private readonly categoryRepository: Repository<CategoriesProduct>,
  ) {}

  async findCategory(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
  async createProduct(dto: CreateProductDto, business: Business) {
    const { categoryId, ...data } = dto;

    const category = await this.findCategory(categoryId);

    const product = this.productRepository.create({
      ...data,
      price: dto.price.toString(),
      business,
      category,
    });

    return this.productRepository.save(product);
  }
}

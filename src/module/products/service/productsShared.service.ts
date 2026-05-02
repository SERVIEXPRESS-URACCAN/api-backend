import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/products.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Business } from 'src/module/business/entities/business.entity';
import { CreateProductDto } from '../dto/porducts.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';

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
  async findProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        business: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
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

  async updateProduct(
    product: Product,
    dto: UpdateProductDto,
    business?: Business,
  ) {
    let category = product.category;

    if (dto.categoryId !== undefined) {
      category = await this.findCategory(dto.categoryId);
    }

    const updatedProduct = this.productRepository.merge(product, {
      name: dto.name ?? product.name,
      description: dto.description ?? product.description,
      price: dto.price !== undefined ? dto.price.toString() : product.price,
      imageUrl: dto.imageUrl ?? product.imageUrl,
      status: dto.status ?? product.status,
      category,
      business: business ?? product.business,
    });

    return this.productRepository.save(updatedProduct);
  }

  async removeProduct(product: Product) {
    await this.productRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }
}

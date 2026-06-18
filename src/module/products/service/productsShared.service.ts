import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/products.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Business } from 'src/module/business/entities/business.entity';
import { CreateProductDto } from '../dto/products.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { validateImage } from 'src/module/business/helper/file.helper';
import * as path from 'path';
import * as fs from 'fs';

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
        categories: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
  private removeFile = (filename: string): void => {
    const filePath = path.join('./uploads/products', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  async createProduct(
    dto: CreateProductDto,
    business: Business,
    file?: Express.Multer.File,
  ) {
    const { categoryIds, ...data } = dto;

    const categories = await Promise.all(
      categoryIds.map((id) => this.findCategory(id)),
    );

    if (file) {
      validateImage(file, 'image');
    }

    const product = this.productRepository.create({
      ...data,
      price: dto.price.toString(),
      business,
      categories,
      imageUrl: file?.filename,
    });

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      if (file) this.removeFile(file.filename);
      throw error;
    }
  }

  async updateProduct(
    product: Product,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
    business?: Business,
  ) {
    let categories = product.categories;

    if (dto.categoryIds !== undefined) {
      categories = await Promise.all(
        dto.categoryIds.map((id) => this.findCategory(id)),
      );
    }

    if (file) {
      validateImage(file, 'image');

      if (product.imageUrl) {
        this.removeFile(product.imageUrl);
      }

      product.imageUrl = file.filename;
    }
    product.name = dto.name ?? product.name;
    product.description = dto.description ?? product.description;
    product.price =
      dto.price !== undefined ? dto.price.toString() : product.price;
    if (dto.status !== undefined) {
      product.status = dto.status;
    }
    product.business = business ?? product.business;

    product.categories = categories;

    return this.productRepository.save(product);
  }

  async removeProduct(product: Product) {
    if (product.imageUrl) {
      this.removeFile(product.imageUrl);
    }

    await this.productRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }
}

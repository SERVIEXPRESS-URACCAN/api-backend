import { Repository } from 'typeorm';
import { Product } from '../entities/products.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';
import { UpdateProductAdminDto } from '../dto/updateProductAdmin.dto';

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CategoriesProduct)
    private readonly categoryRepository: Repository<CategoriesProduct>,
  ) {}
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

  async updateByAdmin(
    id: number,
    updateProductAdminDto: UpdateProductAdminDto,
  ) {
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

    let category = product.category;
    let business = product.business;

    if (updateProductAdminDto.categoryId) {
      const foundCategory = await this.categoryRepository.findOne({
        where: { id: updateProductAdminDto.categoryId },
      });

      if (!foundCategory) {
        throw new NotFoundException('Category not found');
      }

      category = foundCategory;
    }

    if (updateProductAdminDto.businessId) {
      const foundBusiness = await this.businessRepository.findOne({
        where: { id: updateProductAdminDto.businessId },
      });

      if (!foundBusiness) {
        throw new NotFoundException('Business not found');
      }

      business = foundBusiness;
    }

    const updatedProduct = {
      ...product,
      ...updateProductAdminDto,
      price: updateProductAdminDto.price
        ? updateProductAdminDto.price.toString()
        : product.price,
      category,
      business,
    };

    return this.productRepository.save(updatedProduct);
  }
}

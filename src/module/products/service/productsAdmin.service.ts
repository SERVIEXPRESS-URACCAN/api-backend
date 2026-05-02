import { Repository } from 'typeorm';
import { Product } from '../entities/products.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';
import { UpdateProductAdminDto } from '../dto/updateProductAdmin.dto';
import { ProductSharedService } from './productsShared.service';

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,

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
  async createByAdmin(dto: CreateProductAdmin) {
    const { businessId, ...rest } = dto;

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.productSharedService.createProduct(
      {
        ...rest,
        categoryId: dto.categoryId,
      },
      business,
    );
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

  async removeByAdmin(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.remove(product);

    return { message: 'Product deleted successfully' };
  }
}

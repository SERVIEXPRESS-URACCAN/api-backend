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
    });
  }
  findOneByAdmin(id: number) {
    return this.productSharedService.findProduct(id);
  }
  async createByAdmin(dto: CreateProductAdmin, file: Express.Multer.File) {
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
      file,
    );
  }

  async updateByAdmin(
    id: number,
    dto: UpdateProductAdminDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.productSharedService.findProduct(id);

    let business = product.business;

    if (dto.businessId !== undefined) {
      const foundBusiness = await this.businessRepository.findOne({
        where: { id: dto.businessId },
      });

      if (!foundBusiness) {
        throw new NotFoundException('Business not found');
      }

      business = foundBusiness;
    }

    return this.productSharedService.updateProduct(
      product,
      dto,
      file,
      business,
    );
  }

  async removeByAdmin(id: number) {
    const product = await this.productSharedService.findProduct(id);

    return this.productSharedService.removeProduct(product);
  }
}

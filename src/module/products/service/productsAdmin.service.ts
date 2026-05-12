import { Repository } from 'typeorm';
import { Product } from '../entities/products.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductAdmin } from '../dto/createProductAdmin.dto';
import { UpdateProductAdminDto } from '../dto/updateProductAdmin.dto';
import { ProductSharedService } from './productsShared.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}
  async findAllByAdmin(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 30);

    const [products, total] = await this.productRepository.findAndCount({
      relations: {
        business: true,
        category: true,
      },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    const lastPage = Math.ceil(total / safeLimit);

    return {
      data: products,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        lastPage,
        hasNextPage: safePage < lastPage,
      },
    };
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

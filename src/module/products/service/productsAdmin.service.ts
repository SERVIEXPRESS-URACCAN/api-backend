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
  async findAllByAdmin(paginationDto: PaginationDto, businessId?: number) {
    const { page = 1, limit = 12, search } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 30);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business')
      .leftJoinAndSelect('product.categories', 'category');

    if (businessId) {
      qb.andWhere('product.businessId = :businessId', { businessId });
    }
    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / safeLimit);

    return {
      data,
      pagination: {
        total,
        page: safePage,
        hasNextPage: safePage < lastPage,
        lastPage,
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
        categoryIds: dto.categoryIds,
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

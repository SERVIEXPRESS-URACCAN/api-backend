import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { BusinessService } from 'src/module/business/service/business.service';
import { Repository } from 'typeorm';
import { CatalogProductsDto } from '../dto/catalog-products';
import { CreateProductDto } from '../dto/products.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { Product } from '../entities/products.entity';
import { ProductSharedService } from './productsShared.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,
    private readonly businessService: BusinessService,
  ) {}

  async findAllForCatalog(query: CatalogProductsDto) {
    const { page = 1, limit = 12, search, categoryId } = query;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 24);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.business', 'business')
      .leftJoinAndSelect('product.categories', 'category')
      .select([
        'product.id',
        'product.name',
        'product.description',
        'product.price',
        'product.imageUrl',
        'product.createdAt',
        'business.id',
        'business.name',
        'category.id',
        'category.name',
      ]);

    if (categoryId !== undefined) {
      qb.innerJoin(
        'product.categories',
        'selectedCategory',
        'selectedCategory.id = :categoryId',
        { categoryId },
      );
    }

    if (search?.trim()) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    qb.orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.id', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    const [products, total] = await qb.getManyAndCount();

    const lastPage = Math.ceil(total / safeLimit);

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl
          ? `/uploads/products/${encodeURIComponent(product.imageUrl)}`
          : null,
        business: {
          id: product.business.id,
          name: product.business.name,
        },
        categories: product.categories.map((category) => ({
          id: category.id,
          name: category.name,
        })),
      })),
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        lastPage,
        hasNextPage: safePage < lastPage,
      },
    };
  }

  async findAllByOwner(user: AuthUser, paginationDto: PaginationDto) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const { page = 1, limit = 10, search } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 30);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.businessId = :businessId', { businessId: business.id });

    if (search) {
      qb.andWhere(
        'product.name ILIKE :search or product.description ILIKE :search',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('product.createdAt', 'DESC')
      .take(safeLimit)
      .skip((safePage - 1) * safeLimit);

    const [data, total] = await qb.getManyAndCount();

    const lastPage = Math.ceil(total / safeLimit);

    return {
      data,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        lastPage,
        hasNextPage: safePage < lastPage,
      },
    };
  }
  async findOne(id: number, user: AuthUser) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productSharedService.findProduct(id);

    if (product.business.id !== business.id) {
      throw new ForbiddenException('This product is not yours');
    }

    return product;
  }
  async create(
    dto: CreateProductDto,
    file: Express.Multer.File,
    user: AuthUser,
  ) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.productSharedService.createProduct({ ...dto }, business, file);
  }
  async update(
    id: number,
    dto: UpdateProductDto,
    file: Express.Multer.File,
    user: AuthUser,
  ) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productSharedService.findProduct(id);

    if (product.business.id !== business.id) {
      throw new ForbiddenException('This product is not yours');
    }
    return this.productSharedService.updateProduct(product, dto, file);
  }

  async removeByOwner(id: number, user: AuthUser) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productSharedService.findProduct(id);

    if (product.business.id !== business.id) {
      throw new ForbiddenException('This product is not yours');
    }

    return this.productSharedService.removeProduct(product);
  }
}

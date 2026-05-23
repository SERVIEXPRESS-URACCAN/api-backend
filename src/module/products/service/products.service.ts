import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { BusinessService } from 'src/module/business/service/business.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/products.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { Product } from '../entities/products.entity';
import { ProductSharedService } from './productsShared.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,
    private readonly businessService: BusinessService,
  ) {}

  async findAllByOwner(user: AuthUser, paginationDto: PaginationDto) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 30);

    const [data, total] = await this.productRepository.findAndCount({
      where: {
        business: {
          id: business.id,
        },
      },
      relations: {
        category: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        status: true,

        category: {
          id: true,
          name: true,
        },
      },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    const lastPage = Math.ceil(total / safeLimit);

    return {
      data,
      meta: {
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

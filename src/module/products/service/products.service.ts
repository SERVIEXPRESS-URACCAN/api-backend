import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { BusinessService } from 'src/module/business/service/business.service';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/porducts.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { Product } from '../entities/products.entity';
import { ProductSharedService } from './productsShared.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,

    @InjectRepository(CategoriesProduct)
    private readonly categoryRepository: Repository<CategoriesProduct>,

    private readonly businessService: BusinessService,
  ) {}

  async findAllByOwner(user: AuthUser, page = 1, limit = 10) {
    const business = await this.businessService.findOne(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const safeLimit = Math.min(limit, 30);
    const skip = (page - 1) * safeLimit;

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

      skip,
    });
    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        lastPage: Math.ceil(total / safeLimit),
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

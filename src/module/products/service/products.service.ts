import { CreateProductDto } from '../dto/porducts.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/module/business/entities/business.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { ProductSharedService } from './productsShared.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productSharedService: ProductSharedService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CategoriesProduct)
    private readonly categoryRepository: Repository<CategoriesProduct>,
  ) {}

  async findAllByOwner(user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.productRepository.find({
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
    });
  }

  async findOne(id: number, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productRepository.findOne({
      where: {
        id,
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
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.productSharedService.createProduct(dto, business);
  }
  async update(id: number, dto: UpdateProductDto, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const product = await this.productSharedService.findProduct(id);

    if (product.business.id !== business.id) {
      throw new ForbiddenException('This product is not yours');
    }

    return this.productSharedService.updateProduct(product, dto);
  }

  async removeByOwner(id: number, user: AuthUser) {
    const business = await this.businessRepository.findOne({
      where: { owner: { id: user.id } },
    });

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

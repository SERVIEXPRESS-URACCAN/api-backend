import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoriesProductDto } from '../dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from '../dto/update-categories-product.dto';
import { CategoriesProduct } from '../entities/categories-product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CategoriesProductsService {
  constructor(
    @InjectRepository(CategoriesProduct)
    private readonly categoriesProductRepository: Repository<CategoriesProduct>,
  ) {}
  async create(CreateCategoriesProducts: CreateCategoriesProductDto) {
    try {
      const categoriesProducts = this.categoriesProductRepository.create(
        CreateCategoriesProducts,
      );
      return await this.categoriesProductRepository.save(categoriesProducts);
    } catch (error) {
      console.log('Error creating categoriesProducts:', error);
      throw error;
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.categoriesProductRepository.findAndCount({
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: {
        createdAt: 'DESC',
      },
    });

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
  async findOne(id: number) {
    const categoriesProduct = await this.categoriesProductRepository.findOneBy({
      id,
    });
    if (!categoriesProduct) {
      throw new NotFoundException(`categoriesProducts ${id} not found`);
    }
    return categoriesProduct;
  }

  async update(
    id: number,
    updateCategoriesProductsDto: UpdateCategoriesProductDto,
  ) {
    const categoriesProducts = await this.categoriesProductRepository.preload({
      id,
      ...updateCategoriesProductsDto,
    });

    if (!categoriesProducts) {
      throw new NotFoundException(`categoriesProducts #${id} not found`);
    }

    return await this.categoriesProductRepository.save(categoriesProducts);
  }

  async remove(id: number) {
    try {
      const categoriesProducts =
        await this.categoriesProductRepository.findOneBy({
          id,
        });

      if (!categoriesProducts) {
        throw new NotFoundException(`categoriesProducts #${id} not found`);
      }

      await this.categoriesProductRepository.softDelete(id);
      return { message: `categories products #${id} deleted successfully` };
    } catch (error) {
      console.log('Error deleting categories products:', error);
      throw error;
    }
  }
}

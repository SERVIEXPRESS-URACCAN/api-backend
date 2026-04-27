import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CreateCategoriesBusinessDto } from '../dto/create-categories-business.dto';
import { UpdateCategoriesBusinessDto } from '../dto/update-categories-business.dto';
import { CategoriesBusiness } from '../entities/categories-business.entity';

@Injectable()
export class CategoriesBusinessService {
  constructor(
    @InjectRepository(CategoriesBusiness)
    private readonly categoriesBusinessRepository: Repository<CategoriesBusiness>,
  ) {}

  async create(categoriesBusinessDto: CreateCategoriesBusinessDto) {
    try {
      const categoriesBusiness = this.categoriesBusinessRepository.create(
        categoriesBusinessDto,
      );
      return await this.categoriesBusinessRepository.save(categoriesBusiness);
    } catch (error) {
      console.log('Error creating categoriesBusiness:', error);
      throw error;
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.categoriesBusinessRepository.findAndCount({
      relations: ['businesses'],
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
    const categoriesBusiness =
      await this.categoriesBusinessRepository.findOneBy({
        id,
      });
    if (!categoriesBusiness) {
      throw new NotFoundException(`categoriesBusiness ${id} not found`);
    }
    return categoriesBusiness;
  }

  async update(id: number, updateCategoriesDto: UpdateCategoriesBusinessDto) {
    const categoriesBusiness = await this.categoriesBusinessRepository.preload({
      id,
      ...updateCategoriesDto,
    });

    if (!categoriesBusiness) {
      throw new NotFoundException(`categoriesBusiness #${id} not found`);
    }

    return await this.categoriesBusinessRepository.save(categoriesBusiness);
  }

  async remove(id: number) {
    try {
      const categoriesBusiness =
        await this.categoriesBusinessRepository.findOneBy({
          id,
        });

      if (!categoriesBusiness) {
        throw new NotFoundException(`categoriesBusiness #${id} not found`);
      }

      return this.categoriesBusinessRepository.softDelete(id);
    } catch (error) {
      console.log('Error deleting categoriesBusiness:', error);
      throw error;
    }
  }
}

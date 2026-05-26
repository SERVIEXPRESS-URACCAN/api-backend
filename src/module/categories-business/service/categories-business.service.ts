import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const existing = await this.categoriesBusinessRepository.findOne({
      where: { name: categoriesBusinessDto.name },
      withDeleted: true,
    });

    if (existing) {
      if (!existing.deletedAt) {
        throw new ConflictException(
          `La categoría "${categoriesBusinessDto.name}" ya existe.`,
        );
      }
      throw new ConflictException({
        message: `La categoría "${categoriesBusinessDto.name}" fue eliminada anteriormente deseas restaurarla?`,
        canRestore: true,
        id: existing.id,
      });
    }
    const categoriesBusiness = this.categoriesBusinessRepository.create(
      categoriesBusinessDto,
    );
    return await this.categoriesBusinessRepository.save(categoriesBusiness);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const query = this.categoriesBusinessRepository
      .createQueryBuilder('categoriesBusiness')
      .leftJoinAndSelect('categoriesBusiness.businesses', 'businesses')
      .orderBy('categoriesBusiness.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (paginationDto.search?.trim()) {
      query.andWhere('LOWER(categoriesBusiness.name) LIKE :search', {
        search: `%${paginationDto.search.toLowerCase()}%`,
      });
    }

    const [data, total] = await query.getManyAndCount();

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

  async update(
    id: number,
    updateCategoriesBusinessDto: UpdateCategoriesBusinessDto,
  ) {
    if (updateCategoriesBusinessDto.name) {
      const duplicate = await this.categoriesBusinessRepository.findOne({
        where: { name: updateCategoriesBusinessDto.name },
        withDeleted: true,
      });

      if (duplicate && duplicate.id !== id) {
        if (!duplicate.deletedAt) {
          throw new ConflictException(
            `La categoría "${updateCategoriesBusinessDto.name}" ya existe.`,
          );
        }
        throw new ConflictException({
          message: `La categoría "${updateCategoriesBusinessDto.name}" fue eliminada anteriormente deseas restaurarla?`,
          canRestore: true,
          id: duplicate.id,
        });
      }
    }

    const categoriesBusiness = await this.categoriesBusinessRepository.preload({
      id,
      ...updateCategoriesBusinessDto,
    });

    if (!categoriesBusiness) {
      throw new NotFoundException(`CategoriesBusiness #${id} no encontrada.`);
    }

    return await this.categoriesBusinessRepository.save(categoriesBusiness);
  }

  async restore(id: number) {
    const existing = await this.categoriesBusinessRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!existing) {
      throw new NotFoundException(`CategoriesBusiness #${id} no encontrada.`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException(`La categoría #${id} no está eliminada.`);
    }

    await this.categoriesBusinessRepository.restore(id);
    return { message: `Categoría restaurada exitosamente.`, id };
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

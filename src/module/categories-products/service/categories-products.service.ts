import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  async create(createCategoriesProductsDto: CreateCategoriesProductDto) {
    const existing = await this.categoriesProductRepository.findOne({
      where: { name: createCategoriesProductsDto.name },
      withDeleted: true,
    });

    if (existing) {
      if (!existing.deletedAt) {
        throw new ConflictException(
          `La categoría "${createCategoriesProductsDto.name}" ya existe.`,
        );
      }

      throw new ConflictException({
        message: `La categoría "${createCategoriesProductsDto.name}" fue eliminada anteriormente deseas restaurarla?`,
        canRestore: true,
        id: existing.id,
      });
    }

    const categoriesProducts = this.categoriesProductRepository.create(
      createCategoriesProductsDto,
    );
    return await this.categoriesProductRepository.save(categoriesProducts);
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const query = this.categoriesProductRepository
      .createQueryBuilder('categoriesProduct')
      .leftJoinAndSelect('categoriesProduct.products', 'products')
      .orderBy('categoriesProduct.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (paginationDto.search?.trim()) {
      query.andWhere('LOWER(categoriesProduct.name) LIKE :search', {
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
    if (updateCategoriesProductsDto.name) {
      const duplicate = await this.categoriesProductRepository.findOne({
        where: { name: updateCategoriesProductsDto.name },
        withDeleted: true,
      });

      if (duplicate && duplicate.id !== id) {
        if (!duplicate.deletedAt) {
          throw new ConflictException(
            `La categoría "${updateCategoriesProductsDto.name}" ya existe.`,
          );
        }
        throw new ConflictException({
          message: `La categoría "${updateCategoriesProductsDto.name}" fue eliminada anteriormente deseas restaurarla?`,
          canRestore: true,
          id: duplicate.id,
        });
      }
    }

    const categoriesProducts = await this.categoriesProductRepository.preload({
      id,
      ...updateCategoriesProductsDto,
    });

    if (!categoriesProducts) {
      throw new NotFoundException(`CategoriesProduct #${id} no encontrada.`);
    }

    return await this.categoriesProductRepository.save(categoriesProducts);
  }

  async restore(id: number) {
    const existing = await this.categoriesProductRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!existing) {
      throw new NotFoundException(`CategoriesProduct #${id} no encontrada.`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException(`La categoría #${id} no está eliminada.`);
    }

    await this.categoriesProductRepository.restore(id);
    return { message: `Categoría restaurada exitosamente.`, id };
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

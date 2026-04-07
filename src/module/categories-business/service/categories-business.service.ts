import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  findAll() {
    return `This action returns all categoriesBusiness`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriesBusiness`;
  }

  update(id: number, updateCategoriesBusinessDto: UpdateCategoriesBusinessDto) {
    return `This action updates a #${id} categoriesBusiness`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriesBusiness`;
  }
}

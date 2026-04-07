import { Injectable } from '@nestjs/common';
import { CreateCategoriesBusinessDto } from './dto/create-categories-business.dto';
import { UpdateCategoriesBusinessDto } from './dto/update-categories-business.dto';

@Injectable()
export class CategoriesBusinessService {
  create(createCategoriesBusinessDto: CreateCategoriesBusinessDto) {
    return 'This action adds a new categoriesBusiness';
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

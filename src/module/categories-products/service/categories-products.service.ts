import { Injectable } from '@nestjs/common';
import { CreateCategoriesProductDto } from './dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from './dto/update-categories-product.dto';

@Injectable()
export class CategoriesProductsService {
  create(createCategoriesProductDto: CreateCategoriesProductDto) {
    return 'This action adds a new categoriesProduct';
  }

  findAll() {
    return `This action returns all categoriesProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriesProduct`;
  }

  update(id: number, updateCategoriesProductDto: UpdateCategoriesProductDto) {
    return `This action updates a #${id} categoriesProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriesProduct`;
  }
}

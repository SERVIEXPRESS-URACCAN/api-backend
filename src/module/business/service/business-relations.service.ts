import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesBusiness } from 'src/module/categories-business/entities/categories-business.entity';
import { City } from 'src/module/city/entities/city.entity';
import { EntityManager, In } from 'typeorm';
import { Business } from '../entities/business.entity';

@Injectable()
export class BusinessRelationsService {
  async handleCategories(
    manager: EntityManager,
    business: Business,
    businessCategories?: number[],
  ) {
    if (!businessCategories) return;

    const uniqueCategories = [...new Set(businessCategories)];

    const categories = await manager.findBy(CategoriesBusiness, {
      id: In(uniqueCategories),
    });

    if (categories.length !== uniqueCategories.length) {
      throw new NotFoundException('Algunas categorías no existen');
    }

    business.categories = categories;
  }

  async getCity(manager: EntityManager, cityId: number) {
    const city = await manager.findOne(City, {
      where: { id: cityId },
    });

    if (!city) {
      throw new NotFoundException('Ciudad no existe');
    }

    return city;
  }

  async handleCity(
    manager: EntityManager,
    business: Business,
    cityId?: number,
  ) {
    if (!cityId) return;

    const city = await this.getCity(manager, cityId);
    business.city = city;
  }
}

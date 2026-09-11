import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMotorcycleModelDto } from '../dto/create-motorcycle-model.dto';
import { UpdateMotorcycleModelDto } from '../dto/update-motorcycle-model.dto';
import { MotorcycleModel } from '../entities/motorcycle-model.entity';
import { MotorcycleBrand } from '../../motorcycle-brand/entities/motorcycle-brand.entity';

@Injectable()
export class MotorcycleModelService {
  constructor(
    @InjectRepository(MotorcycleModel)
    private readonly motorcycleModelRepository: Repository<MotorcycleModel>,

    @InjectRepository(MotorcycleBrand)
    private readonly motorcycleBrandRepository: Repository<MotorcycleBrand>,
  ) {}

  getAll() {
    return this.motorcycleModelRepository.find({
      relations: ['brand'],
    });
  }

  getOne(id: number) {
    return this.motorcycleModelRepository.findOne({
      where: { id },
      relations: ['brand'],
    });
  }

  getByBrand(brandId: number) {
    return this.motorcycleModelRepository.find({
      where: {
        brand: {
          id: brandId,
        },
      },
    });
  }

  async create(motorcycleModelDto: CreateMotorcycleModelDto) {
    try {
      const brand = await this.motorcycleBrandRepository.findOneBy({
        id: motorcycleModelDto.brand_id,
      });

      if (!brand) {
        throw new NotFoundException(
          `Marca #${motorcycleModelDto.brand_id} no encontrada`,
        );
      }

      const motorcycleModel = this.motorcycleModelRepository.create({
        name: motorcycleModelDto.name,
        brand,
      });

      return await this.motorcycleModelRepository.save(motorcycleModel);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('El modelo ya existe');
      }

      throw error;
    }
  }

  async update(id: number, motorcycleModelDto: UpdateMotorcycleModelDto) {
    try {
      const model = await this.motorcycleModelRepository.findOneBy({ id });

      if (!model) {
        throw new NotFoundException(`Modelo #${id} no encontrado`);
      }

      if (motorcycleModelDto.brand_id) {
        const brand = await this.motorcycleBrandRepository.findOneBy({
          id: motorcycleModelDto.brand_id,
        });

        if (!brand) {
          throw new NotFoundException(
            `Marca #${motorcycleModelDto.brand_id} no encontrada`,
          );
        }

        model.brand = brand;
      }

      if (motorcycleModelDto.name) {
        model.name = motorcycleModelDto.name;
      }

      return await this.motorcycleModelRepository.save(model);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('El modelo ya existe');
      }

      throw error;
    }
  }
}

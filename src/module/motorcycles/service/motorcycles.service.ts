import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { MotorcycleModel } from 'src/module/motorcycle-model/entities/motorcycle-model.entity';

import { Motorcycle } from '../entities/motorcycle.entity';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';

@Injectable()
export class MotorcyclesService {
  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,

    @InjectRepository(MotorcycleModel)
    private readonly motorcycleModelRepository: Repository<MotorcycleModel>,
  ) {}

  async findMine(user: AuthUser) {
    const motorcycle = await this.motorcycleRepository.findOne({
      where: {
        mandadero: {
          user: {
            id: user.id,
          },
        },
      },
      relations: ['mandadero', 'mandadero.user', 'model', 'model.brand'],
    });

    if (!motorcycle) {
      throw new BadRequestException('Motorcycle not found');
    }

    return motorcycle;
  }

  async findAll() {
    return this.motorcycleRepository.find({
      relations: ['mandadero', 'model', 'model.brand'],
    });
  }

  async findOne(id: number) {
    const motorcycle = await this.motorcycleRepository.findOne({
      where: { id },
      relations: ['mandadero', 'model', 'model.brand'],
    });

    if (!motorcycle) {
      throw new BadRequestException('Motorcycle not found');
    }

    return motorcycle;
  }

  async update(id: number, dto: UpdateMotorcycleDto) {
    const motorcycle = await this.findOne(id);

    if (dto.licensePlate) {
      const exists = await this.motorcycleRepository.findOne({
        where: {
          licensePlate: dto.licensePlate,
        },
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException('License plate already registered');
      }

      motorcycle.licensePlate = dto.licensePlate;
    }

    if (dto.model_id) {
      const motorcycleModel = await this.motorcycleModelRepository.findOne({
        where: {
          id: dto.model_id,
        },
      });

      if (!motorcycleModel) {
        throw new BadRequestException('Motorcycle model not found');
      }

      motorcycle.model = motorcycleModel;
    }

    if (dto.color !== undefined) {
      motorcycle.color = dto.color;
    }

    return this.motorcycleRepository.save(motorcycle);
  }

  async updateMine(dto: UpdateMotorcycleDto, user: AuthUser) {
    const motorcycle = await this.findMine(user);

    if (dto.licensePlate) {
      const exists = await this.motorcycleRepository.findOne({
        where: {
          licensePlate: dto.licensePlate,
        },
      });

      if (exists && exists.id !== motorcycle.id) {
        throw new BadRequestException('License plate already registered');
      }

      motorcycle.licensePlate = dto.licensePlate;
    }

    if (dto.model_id) {
      const motorcycleModel = await this.motorcycleModelRepository.findOne({
        where: {
          id: dto.model_id,
        },
      });

      if (!motorcycleModel) {
        throw new BadRequestException('Motorcycle model not found');
      }

      motorcycle.model = motorcycleModel;
    }

    if (dto.color !== undefined) {
      motorcycle.color = dto.color;
    }

    return this.motorcycleRepository.save(motorcycle);
  }
}

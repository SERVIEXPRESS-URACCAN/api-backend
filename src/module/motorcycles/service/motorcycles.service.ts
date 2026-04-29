import { BadRequestException, Injectable } from '@nestjs/common';
import { Motorcycle } from '../entities/motorcycle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
@Injectable()
export class MotorcyclesService {
  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,
  ) {}

  async findMine(user: AuthUser) {
    const motorcycles = await this.motorcycleRepository.findOne({
      where: { mandadero: { user: { id: user.id } } },
      relations: ['mandadero', 'mandadero.user'],
    });
    if (!motorcycles) {
      throw new BadRequestException('Motorcycle not found');
    }
    return motorcycles;
  }

  async findAll() {
    return this.motorcycleRepository.find({
      relations: ['mandadero'],
    });
  }

  async findOne(id: number) {
    const motorcycle = await this.motorcycleRepository.findOne({
      where: { id },
      relations: ['mandadero'],
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
        where: { licensePlate: dto.licensePlate },
      });

      if (exists && exists.id !== id) {
        throw new BadRequestException('License plate already registered');
      }
    }
    Object.assign(motorcycle, dto);

    return this.motorcycleRepository.save(motorcycle);
  }

  async updateMine(dto: UpdateMotorcycleDto, user: AuthUser) {
    const motorcycle = await this.findMine(user);

    if (dto.licensePlate) {
      const exists = await this.motorcycleRepository.findOne({
        where: { licensePlate: dto.licensePlate },
      });

      if (exists && exists.id !== motorcycle.id) {
        throw new BadRequestException('License plate already registered');
      }
    }

    Object.assign(motorcycle, dto);

    return this.motorcycleRepository.save(motorcycle);
  }
}

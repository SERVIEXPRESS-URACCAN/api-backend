import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Motorcycle } from '../entities/motorcycle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { MotorcycleBrand } from 'src/module/motorcycle-brands/entities/motorcycle-brand.entity';
@Injectable()
export class MotorcyclesService {
  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,

    @InjectRepository(MotorcycleBrand)
    private readonly brandRepository: Repository<MotorcycleBrand>,
  ) {}

  async findMine(user: AuthUser) {
    const motorcycles = await this.motorcycleRepository.findOne({
      where: { mandadero: { user: { id: user.id } } },
      relations: ['mandadero', 'mandadero.user', 'brand'],
    });
    if (!motorcycles) {
      throw new BadRequestException('Motorcycle not found');
    }
    return motorcycles;
  }

  async findAll() {
    return this.motorcycleRepository.find({
      relations: ['mandadero', 'brand'],
    });
  }

  async findOne(id: number) {
    const motorcycle = await this.motorcycleRepository.findOne({
      where: { id },
      relations: ['mandadero', 'brand'],
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

    if (dto.brandId !== undefined) {
      const brand = await this.brandRepository.findOne({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }

      motorcycle.brand = brand;
    }

    const motorcycleData = {
      model: dto.model,
      color: dto.color,
      licensePlate: dto.licensePlate,
    };

    Object.assign(motorcycle, motorcycleData);

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

    if (dto.brandId !== undefined) {
      const brand = await this.brandRepository.findOne({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }

      motorcycle.brand = brand;
    }

    const motorcycleData = {
      model: dto.model,
      color: dto.color,
      licensePlate: dto.licensePlate,
    };

    Object.assign(motorcycle, motorcycleData);

    return this.motorcycleRepository.save(motorcycle);
  }
}

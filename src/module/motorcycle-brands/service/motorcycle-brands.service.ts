import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorcycleBrand } from '../entities/motorcycle-brand.entity';

@Injectable()
export class MotorcycleBrandsService {
  constructor(
    @InjectRepository(MotorcycleBrand)
    private readonly brandRepository: Repository<MotorcycleBrand>,
  ) {}

  async findAllBrand() {
    return this.brandRepository.find({
      order: { name: 'ASC' },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async create(name: string) {
    const normalizedName = name.trim();

    const existingBrand = await this.brandRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingBrand) {
      throw new ConflictException('Esta marca ya está registrada');
    }

    const brand = this.brandRepository.create({
      name: normalizedName,
    });

    return this.brandRepository.save(brand);
  }

  async update(id: number, name: string) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    const normalizedName = name.trim();

    const existingBrand = await this.brandRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingBrand && existingBrand.id !== id) {
      throw new ConflictException('Esta marca ya está registrada');
    }

    brand.name = normalizedName;

    return this.brandRepository.save(brand);
  }
  async remove(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    const motorcyclesCount = await this.brandRepository
      .createQueryBuilder('brand')
      .innerJoin('brand.motorcycles', 'motorcycle')
      .where('brand.id = :id', { id })
      .getCount();

    if (motorcyclesCount > 0) {
      throw new ConflictException(
        'No se puede eliminar esta marca porque está asociada a motocicletas',
      );
    }

    await this.brandRepository.remove(brand);

    return {
      message: 'Marca eliminada correctamente',
    };
  }
}

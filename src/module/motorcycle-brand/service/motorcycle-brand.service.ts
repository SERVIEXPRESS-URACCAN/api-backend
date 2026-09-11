import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotorcycleBrand } from '../entities/motorcycle-brand.entity';
import { Repository } from 'typeorm';
import { CreateMotorcycleBrandDto } from '../dto/create-motorcycle-brand.dto';
import { UpdateMotorcycleBrandDto } from '../dto/update-motorcycle-brand.dto';

@Injectable()
export class MotorcycleBrandService {
  constructor(
    @InjectRepository(MotorcycleBrand)
    private readonly motorcycleBrandRepository: Repository<MotorcycleBrand>,
  ) {}

  getAll() {
    return this.motorcycleBrandRepository.find();
  }

  getOne(id: number) {
    return this.motorcycleBrandRepository.findOne({ where: { id } });
  }

  async create(motorcycleBrandDto: CreateMotorcycleBrandDto) {
    try {
      const motorcycleBrand =
        this.motorcycleBrandRepository.create(motorcycleBrandDto);
      return await this.motorcycleBrandRepository.save(motorcycleBrand);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new Error('La marca de motocicleta ya existe');
      }
      throw error;
    }
  }

  async update(id: number, motorcycleBrandDto: UpdateMotorcycleBrandDto) {
    try {
      const motorcycleBrand = await this.motorcycleBrandRepository.update(
        id,
        motorcycleBrandDto,
      );

      if (motorcycleBrand.affected === 0) {
        throw new NotFoundException(`Marca #${id} no encontrada`);
      }

      return this.motorcycleBrandRepository.findOneBy({ id });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('La marca ya existe');
      }

      throw error;
    }
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { City } from '../entities/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  getAll() {
    return this.cityRepository.find();
  }

  getOne(id: number) {
    return this.cityRepository.findOneBy({ id });
  }

  async create(cityDto: CreateCityDto) {
    try {
      const city = this.cityRepository.create(cityDto);
      return await this.cityRepository.save(city);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('La ciudad ya existe');
      }

      throw error;
    }
  }

  async update(id: number, cityDto: UpdateCityDto) {
    try {
      const city = await this.cityRepository.update(id, cityDto);

      if (city.affected === 0) {
        throw new NotFoundException(`City #${id} not found`);
      }

      return this.cityRepository.findOneBy({ id });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('La ciudad ya existe');
      }

      throw error;
    }
  }
}

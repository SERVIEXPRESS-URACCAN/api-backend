import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mandadero } from '../entities/mandadero.entity';
import { CreateMandaderoDto } from '../dto/create-mandadero.dto';

@Injectable()
export class MandaderoService {
  constructor(
    @InjectRepository(Mandadero)
    private readonly mandaderoRepository: Repository<Mandadero>,
  ) {}

  async updateAvailability(id: number, available: boolean) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });
    if (!mandadero) {
      throw new NotFoundException('Mandadero no encontrado');
    }

    if (!mandadero.isActive) {
      throw new BadRequestException('El perfil no está activo');
    }

    mandadero.available = available;

    return this.mandaderoRepository.save(mandadero);
  }

  async updateActive(id: number, isActive: boolean) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });
    if (!mandadero) {
      throw new NotFoundException('Mandadero no encontrado');
    }

    mandadero.isActive = isActive;

    return this.mandaderoRepository.save(mandadero);
  }

  async create(CreateMandaderoDto: CreateMandaderoDto) {
    const mandadero = this.mandaderoRepository.create({
      ...CreateMandaderoDto,
      user: { id: CreateMandaderoDto.user },
    });

    return await this.mandaderoRepository.save(mandadero);
  }

  async findAll() {
    return this.mandaderoRepository.find({ relations: ['user'] });
  }

  async findOne(id: number) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!mandadero) throw new NotFoundException('Mandadero no encontrado');

    return mandadero;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
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
  async changeStatusByUser(userId: number, disponible: boolean) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!mandadero) throw new NotFoundException('Mandadero no encontrado');

    mandadero.available = disponible;
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

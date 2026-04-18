import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mandadero } from '../entities/mandadero.entity';
import { CreateMandaderoDto } from '../dto/create-mandadero.dto';
import { User } from 'src/module/users/entities/user.entity';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class MandaderoService {
  constructor(
    @InjectRepository(Mandadero)
    private readonly mandaderoRepository: Repository<Mandadero>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateAvailability(id: number, available: boolean) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    if (!mandadero.isActive) {
      throw new BadRequestException(
        'Cannot change availability of an inactive mandadero',
      );
    }

    mandadero.available = available;

    return this.mandaderoRepository.save(mandadero);
  }

  async updateActive(id: number, isActive: boolean) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    mandadero.isActive = isActive;

    return this.mandaderoRepository.save(mandadero);
  }

  async create(dto: CreateMandaderoDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.user },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const mandadero = this.mandaderoRepository.create({
      available: dto.available,
      isActive: true,
      user,
    });

    return this.mandaderoRepository.save(mandadero);
  }

  async findAll() {
    return this.mandaderoRepository.find({
      relations: ['user', 'user.role', 'motorcycle'],
    });
  }

  async findOne(id: number) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { id },
      relations: ['user', 'user.role', 'motorcycle'],
    });

    if (!mandadero) throw new NotFoundException('Mandadero not found');

    return mandadero;
  }
  async remove(id: number) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    return this.mandaderoRepository.softDelete(id);
  }

  async createWithFile(body: CreateMandaderoDto, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id: body.user },
    });

    if (!user) {
      throw new NotFoundException('User no encontrado');
    }

    const mandadero = this.mandaderoRepository.create({
      available: body.available,
      isActive: true,
      user,
      imageIdentification: file?.filename,
    });

    return this.mandaderoRepository.save(mandadero);
  }

  async updateFile(id: number, file: Express.Multer.File) {
    const mandadero = await this.mandaderoRepository.findOne({ where: { id } });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    //boorra la vieja
    if (mandadero.imageIdentification) {
      const oldFile = path.join(
        process.cwd(),
        'uploads/mandaderos',
        mandadero.imageIdentification,
      );
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    }
    mandadero.imageIdentification = file.filename;

    return this.mandaderoRepository.save(mandadero);
  }
}

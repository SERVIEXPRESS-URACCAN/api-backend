import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMotorcycleDto } from '../dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motorcycle } from '../entities/motorcycle.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';

type UploadedFile = {
  path: string;
};
@Injectable()
export class MotorcyclesService {
  constructor(
    @InjectRepository(Motorcycle)
    private readonly motorcycleRepository: Repository<Motorcycle>,
    @InjectRepository(Mandadero)
    private readonly mandaderoRepository: Repository<Mandadero>,
  ) {}

  private existing(condition: boolean, message: string) {
    if (condition) {
      throw new ConflictException(message);
    }
  }

  async create(createDto: CreateMotorcycleDto) {
    const { mandaderoId, ...data } = createDto;

    const mandadero = await this.mandaderoRepository.findOne({
      where: { id: mandaderoId },
      relations: ['motorcycle'],
    });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }
    this.existing(!!mandadero.motorcycle, 'Mandadero already has a motorcycle');

    const licenseExists = await this.motorcycleRepository.findOne({
      where: { licensePlate: data.licensePlate },
    });
    this.existing(!!licenseExists, 'License plate already registered');

    const motorcycle = this.motorcycleRepository.create({
      ...data,
      mandadero,
    });
    return this.motorcycleRepository.save(motorcycle);
  }

  findAll() {
    return this.motorcycleRepository.find({ relations: ['mandadero'] });
  }

  async findOne(id: number) {
    const motorcycle = await this.motorcycleRepository.findOne({
      where: { id },
      relations: ['mandadero'],
    });
    if (!motorcycle) {
      throw new NotFoundException('Motorcycle not found');
    }
    return motorcycle;
  }

  async update(id: number, update: UpdateMotorcycleDto) {
    const motorcycle = await this.findOne(id);
    Object.assign(motorcycle, update);
    return await this.motorcycleRepository.save(motorcycle);
  }

  async remove(id: number) {
    const result = await this.motorcycleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Motorcycle not found');
    }
    return { message: 'Motorcycle removed successfully' };
  }

  async createWithFiles(
    body: CreateMotorcycleDto,
    files: {
      circulationImage?: UploadedFile[];
      insuranceImage?: UploadedFile[];
    },
  ) {
    const circulationImage = files?.circulationImage?.[0]?.path;
    const insuranceImage = files?.insuranceImage?.[0]?.path;

    if (!circulationImage || !insuranceImage) {
      throw new BadRequestException(
        'Circulation and insurance images are required',
      );
    }
    return this.create({
      ...body,
      circulationImage,
      insuranceImage,
    });
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Repository } from 'typeorm';
import { CreateMotorcycleDto } from '../dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { Motorcycle } from '../entities/motorcycle.entity';

import { validateFile } from '../../../common/helper/validationFiles.helper';
import { updateImage } from '../../../common/helper/updateImage.helper';
import { deleteFile } from '../../../common/helper/removeOldImage.helper';

type UploadedFile = {
  path: string;
  mimetype: string;
  size: number;
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

  private revalidationDocuments(
    update?: UpdateMotorcycleDto,
    files?: {
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
  ): boolean {
    return Boolean(
      update?.circulationImage ||
      update?.insuranceImage ||
      (files?.circulationImage?.length ?? 0) > 0 ||
      (files?.insuranceImage?.length ?? 0) > 0,
    );
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
      withDeleted: false,
    });
    this.existing(!!licenseExists, 'License plate already registered');

    const motorcycle = this.motorcycleRepository.create({
      ...data,
      mandadero,
      status: ApprovalStatus.PENDING,
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

    if (update.licensePlate) {
      const exists = await this.motorcycleRepository.findOne({
        where: { licensePlate: update.licensePlate },
        withDeleted: false,
      });
      if (exists && exists.id !== id) {
        throw new ConflictException('License plate already registered');
      }
    }

    if (this.revalidationDocuments(update)) {
      motorcycle.status = ApprovalStatus.PENDING;
    }

    Object.assign(motorcycle, update);
    return await this.motorcycleRepository.save(motorcycle);
  }

  async remove(id: number) {
    const motorcycle = await this.findOne(id);

    deleteFile(motorcycle.circulationImage);
    deleteFile(motorcycle.insuranceImage);

    const result = await this.motorcycleRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Motorcycle not found');
    }
    return { message: 'Motorcycle removed successfully' };
  }

  async restore(id: number) {
    const motorcycle = await this.motorcycleRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!motorcycle) {
      throw new NotFoundException('Motorcycle not found');
    }

    if (!motorcycle.deletedAt) {
      throw new BadRequestException('Motorcycle is not deleted');
    }

    await this.motorcycleRepository.restore(id);

    return { message: 'Motorcycle restored successfully' };
  }

  async createWithFiles(
    body: CreateMotorcycleDto,
    files: {
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
  ) {
    const circulation = files?.circulationImage?.[0];
    const insurance = files?.insuranceImage?.[0];

    if (!circulation || !insurance) {
      throw new BadRequestException(
        'Circulation and insurance images are required',
      );
    }

    validateFile(circulation, 'Circulation image');
    validateFile(insurance, 'Insurance image');

    return this.create({
      ...body,
      circulationImage: circulation.path,
      insuranceImage: insurance.path,
    });
  }

  async updateWithFiles(
    id: number,
    body: UpdateMotorcycleDto,
    files: {
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
  ) {
    const motorcycle = await this.findOne(id);

    const circulation = files?.circulationImage?.[0];
    const insurance = files?.insuranceImage?.[0];

    if (circulation) {
      validateFile(circulation, 'Circulation image');
    }
    if (insurance) {
      validateFile(insurance, 'Insurance image');
    }

    motorcycle.circulationImage = updateImage(
      circulation,
      motorcycle.circulationImage,
    );
    motorcycle.insuranceImage = updateImage(
      insurance,
      motorcycle.insuranceImage,
    );

    if (this.revalidationDocuments(body, files)) {
      motorcycle.status = ApprovalStatus.PENDING;
    }
    Object.assign(motorcycle, body);

    return this.motorcycleRepository.save(motorcycle);
  }
}

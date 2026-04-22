import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from 'src/module/users/entities/user.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Owner } from '../entities/owner.entity';
import { validateImage } from '../helper/file.helper';
import { processImage } from '../helper/owner-file.helper';

@Injectable()
export class OwnerService {
  private readonly logger = new Logger('OwnerService');
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.ownerRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number) {
    const owner = await this.ownerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!owner) {
      throw new NotFoundException('Propietario no encontrado');
    }

    return owner;
  }

  async create(
    createOwnerDto: CreateOwnerDto,
    files?: {
      identificationCardImage?: Express.Multer.File[];
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const identificationCardImage = files?.identificationCardImage?.[0];

    try {
      if (!identificationCardImage) {
        throw new BadRequestException('La imagen de la cédula es obligatoria');
      }

      validateImage(identificationCardImage, 'identificationCardImage');

      const user = await queryRunner.manager.findOne(User, {
        where: { id: createOwnerDto.user },
      });

      if (!user) throw new NotFoundException('User no existe');

      const owner = queryRunner.manager.create(Owner, {
        ...createOwnerDto,
        user,
        identificationCardImage: identificationCardImage.filename,
      });

      const saved = await queryRunner.manager.save(owner);

      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (identificationCardImage)
        this.removeFile(identificationCardImage.filename);

      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updateOwnerDto: UpdateOwnerDto,
    files?: {
      identificationCardImage?: Express.Multer.File[];
    },
  ) {
    const owner = await this.findOne(id);

    const { user, ...rest } = updateOwnerDto;

    this.ownerRepository.merge(owner, rest);

    if (user) {
      const userEntity = await this.userRepository.findOneBy({ id: user });
      if (!userEntity) throw new NotFoundException('El usuario no existe');
      owner.user = userEntity;
    }

    const identificationCardImage = files?.identificationCardImage?.[0];

    if (identificationCardImage) {
      validateImage(identificationCardImage, 'identificationCardImage');
    }

    processImage(
      owner,
      identificationCardImage,
      'identificationCardImage',
      this.removeFile.bind(this),
    );

    try {
      return await this.ownerRepository.save(owner);
    } catch (error) {
      if (identificationCardImage)
        this.removeFile(identificationCardImage.filename);
      this.handleDBException(error);
    }
  }

  async remove(id: number) {
    const owner = await this.findOne(id);

    const result = await this.ownerRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Owner no encontrado');
    }

    if (owner.identificationCardImage) {
      this.removeFile(owner.identificationCardImage);
    }

    return { message: 'Eliminado correctamente' };
  }

  private removeFile(filename: string) {
    const filePath = path.join('./uploads/owners', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private handleDBException(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const err = error as QueryFailedError & {
        driverError: { code?: string; detail?: string };
      };

      if (err.driverError?.code === '23505') {
        throw new BadRequestException('Dato duplicado');
      }
    }
    this.logger.error(error);
    throw new BadRequestException('Error en la base de datos');
  }
}

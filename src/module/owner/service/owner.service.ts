import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { User } from 'src/module/users/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  CreateOwnerDto,
  formatPhone,
  Owner,
  UpdateOwnerDto,
  validateImage,
} from '../';
import { processImage } from '../helper/owner-file.helper';

@Injectable()
export class OwnerService {
  private readonly logger = new Logger('OwnerService');
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
  ) {}

  async findAll() {
    return await this.ownerRepository.find({
      relations: ['user', 'gender'],
    });
  }

  async findOne(id: number) {
    const owner = await this.ownerRepository.findOne({
      where: { id },
      relations: ['user', 'gender'],
    });

    if (!owner) {
      throw new NotFoundException('Propietario no encontrado');
    }

    return owner;
  }

  async create(
    createOwnerDto: CreateOwnerDto,
    files?: {
      profileImage?: Express.Multer.File[];
      identificationCardImage?: Express.Multer.File[];
    },
  ) {
    const profileImage = files?.profileImage?.[0];
    const identificationCardImage = files?.identificationCardImage?.[0];

    if (!profileImage || !identificationCardImage) {
      throw new BadRequestException('Las imágenes son obligatorias');
    }

    validateImage(profileImage, 'profileImage');
    validateImage(identificationCardImage, 'identificationCardImage');

    const cellphone = formatPhone(createOwnerDto.cellphone);

    const user = await this.userRepository.findOneBy({
      id: createOwnerDto.user,
    });

    if (!user) throw new NotFoundException('User no existe');

    const gender = await this.genderRepository.findOneBy({
      id: createOwnerDto.gender,
    });

    if (!gender) throw new NotFoundException('Gender no existe');

    const owner = this.ownerRepository.create({
      ...createOwnerDto,
      user,
      gender,
      cellphone,
      profileImage: profileImage.filename,
      identificationCardImage: identificationCardImage.filename,
    });

    try {
      return await this.ownerRepository.save(owner);
    } catch (error) {
      if (profileImage) this.removeFile(profileImage.filename);
      if (identificationCardImage)
        this.removeFile(identificationCardImage.filename);
      this.handleDBException(error);
    }
  }

  async update(
    id: number,
    updateOwnerDto: UpdateOwnerDto,
    files?: {
      profileImage?: Express.Multer.File[];
      identificationCardImage?: Express.Multer.File[];
    },
  ) {
    const owner = await this.findOne(id);

    const { gender, user, ...rest } = updateOwnerDto;

    this.ownerRepository.merge(owner, rest);

    if (gender) {
      const genderEntity = await this.genderRepository.findOneBy({
        id: gender,
      });
      if (!genderEntity) throw new NotFoundException('El genero no existe');
      owner.gender = genderEntity;
    }

    if (user) {
      const userEntity = await this.userRepository.findOneBy({ id: user });
      if (!userEntity) throw new NotFoundException('El usuario no existe');
      owner.user = userEntity;
    }

    if (updateOwnerDto.cellphone) {
      owner.cellphone = formatPhone(updateOwnerDto.cellphone);
    }

    const profileImage = files?.profileImage?.[0];
    const identificationCardImage = files?.identificationCardImage?.[0];

    validateImage(profileImage, 'profileImage');
    validateImage(identificationCardImage, 'identificationCardImage');

    processImage(
      owner,
      profileImage,
      'profileImage',
      this.removeFile.bind(this),
    );

    processImage(
      owner,
      identificationCardImage,
      'identificationCardImage',
      this.removeFile.bind(this),
    );

    try {
      return await this.ownerRepository.save(owner);
    } catch (error) {
      if (profileImage) this.removeFile(profileImage.filename);
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

    if (owner.profileImage) {
      this.removeFile(owner.profileImage);
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

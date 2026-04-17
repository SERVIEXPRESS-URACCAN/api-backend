import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { User } from 'src/module/users/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Owner } from '../entities/owner.entity';
import { validateImage } from '../helper/file.helper';
import { formatPhone } from '../helper/phone.helper';

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

    if (profileImage) {
      validateImage(profileImage, 'profileImage');
      owner.profileImage = profileImage.filename;
    }

    if (identificationCardImage) {
      validateImage(identificationCardImage, 'identificationCardImage');
      owner.identificationCardImage = identificationCardImage.filename;
    }

    try {
      return await this.ownerRepository.save(owner);
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async remove(id: number) {
    const result = await this.ownerRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Owner no encontrado');
    }

    return { message: 'Eliminado correctamente' };
  }

  private handleDBException(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const err = error as QueryFailedError & {
        driverError: { code?: string; detail?: string };
      };

      if (err.driverError?.code === '23505') {
        const detail = err.driverError.detail;

        if (detail?.includes('cellphone')) {
          throw new BadRequestException(
            'El número de telefono ya está registrado',
          );
        }

        if (detail?.includes('user_id')) {
          throw new BadRequestException(
            'El usuario ya tiene un propietario asociado',
          );
        }

        throw new BadRequestException('Dato duplicado');
      }
    }
    this.logger.error(error);
    throw new BadRequestException('Error en la base de datos');
  }
}

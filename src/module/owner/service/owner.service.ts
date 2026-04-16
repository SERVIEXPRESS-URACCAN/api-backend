import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { User } from 'src/module/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Owner } from '../entities/owner.entity';

@Injectable()
export class OwnerService {
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
      throw new NotFoundException('Owner no encontrado');
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

    if (!profileImage.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      throw new BadRequestException('Formato inválido en profileImage');
    }

    if (!identificationCardImage.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      throw new BadRequestException('Formato inválido en identificación');
    }

    const cellphone = `+505${createOwnerDto.cellphone}`;

    const existing = await this.ownerRepository.findOne({
      where: { cellphone },
    });
    if (existing) {
      throw new BadRequestException('El número ya está registrado');
    }

    const user = await this.userRepository.findOneBy({
      id: createOwnerDto.user,
    });

    if (!user) {
      throw new NotFoundException('User no existe');
    }

    const gender = await this.genderRepository.findOneBy({
      id: createOwnerDto.gender,
    });

    if (!gender) {
      throw new NotFoundException('Gender no existe');
    }

    const owner = this.ownerRepository.create({
      ...createOwnerDto,
      user,
      gender,
      cellphone,
      profileImage: profileImage.filename,
      identificationCardImage: identificationCardImage.filename,
    });

    return this.ownerRepository.save(owner);
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

    Object.assign(owner, updateOwnerDto);

    if (updateOwnerDto.cellphone) {
      owner.cellphone = `+505${updateOwnerDto.cellphone}`;

      const existing = await this.ownerRepository.findOne({
        where: { cellphone: owner.cellphone },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('El número ya está registrado');
      }
    }

    const profileImage = files?.profileImage?.[0];
    const identificationCardImage = files?.identificationCardImage?.[0];

    if (profileImage) {
      if (!profileImage.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        throw new BadRequestException('Formato inválido para foto de perfil');
      }

      owner.profileImage = profileImage.filename;
    }

    if (identificationCardImage) {
      if (!identificationCardImage.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        throw new BadRequestException(
          'Formato inválido para cedula de identidad',
        );
      }

      owner.identificationCardImage = identificationCardImage.filename;
    }

    return this.ownerRepository.save(owner);
  }

  async remove(id: number) {
    const result = await this.ownerRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Owner no encontrado');
    }

    return { message: 'Eliminado correctamente' };
  }
}

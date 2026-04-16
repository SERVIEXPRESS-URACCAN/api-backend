import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createOwnerDto: CreateOwnerDto) {
    const cellphone = `+505${createOwnerDto.cellphone}`;

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
    });

    return this.ownerRepository.save(owner);
  }

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

  async update(id: number, updateOwnerDto: UpdateOwnerDto) {
    const owner = await this.findOne(id);

    if (updateOwnerDto.cellphone) {
      owner.cellphone = `+505${updateOwnerDto.cellphone}`;
    }

    Object.assign(owner, updateOwnerDto);

    return await this.ownerRepository.save(owner);
  }

  async remove(id: number) {
    const result = await this.ownerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Owner no encontrado');
    }

    return { message: 'Eliminado correctamente' };
  }
}

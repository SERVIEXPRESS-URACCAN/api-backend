import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    const profile = this.profileRepository.create({
      ...createProfileDto,
      gender: { id: createProfileDto.gender },
      user: { id: createProfileDto.user },
    });

    return await this.profileRepository.save(profile);
  }

  async getAll() {
    return await this.profileRepository.find({
      relations: ['gender', 'user'],
    });
  }

  async getOne(id: number) {
    return await this.profileRepository.findOne({
      where: { id },
      relations: ['gender', 'user'],
    });
  }

  async update(id: number, profileDto: UpdateProfileDto) {
    const { gender, user, ...rest } = profileDto;

    const profile = await this.profileRepository.preload({
      id,
      ...rest,
      ...(gender && { gender: { id: gender } }),
      ...(user && { user: { id: user } }),
    });

    if (!profile) {
      throw new NotFoundException(`El perfil con id ${id} no existe`);
    }

    return await this.profileRepository.save(profile);
  }
}

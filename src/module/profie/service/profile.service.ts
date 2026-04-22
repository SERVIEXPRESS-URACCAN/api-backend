import { Gender } from 'src/module/gender/entities/gender.entity';
import { CreateProfileDto } from '../dto/profile.dto';
import { User } from 'src/module/users/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from '../entities/profile.entity';
import { DataSource } from 'typeorm';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateProfileDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: dto.user_id },
      });

      if (!user) throw new NotFoundException('User no encontrado');

      const existingProfile = await queryRunner.manager.findOne(Profile, {
        where: { user: { id: dto.user_id } },
      });

      if (existingProfile) {
        throw new BadRequestException('Este usuario ya tiene un perfil');
      }

      const gender = await queryRunner.manager.findOne(Gender, {
        where: { id: dto.gender_id },
      });

      if (!gender) {
        throw new NotFoundException('Gender no encontrado');
      }

      const prifile = queryRunner.manager.create(Profile, {
        name: dto.name,
        lastName: dto.lastName,
        cellphone: dto.cellphone,
        gender,
        user,
      });

      const savedProfile = await queryRunner.manager.save(prifile);

      await queryRunner.commitTransaction();

      return savedProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findOne(id: number) {
    const profile = await this.dataSource.getRepository(Profile).findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Profile no encontrado');

    return profile;
  }
  async findAll() {
    return this.dataSource.getRepository(Profile).find({
      relations: ['user'],
    });
  }

  async update(id: number, dto: UpdateProfileDto) {
    const repo = this.dataSource.getRepository(Profile);

    const profile = await this.findOne(id);

    if (dto.gender_id) {
      const gender = await this.dataSource.getRepository(Gender).findOne({
        where: { id: dto.gender_id },
      });

      if (!gender) throw new NotFoundException('Gender no encontrado');

      profile.gender = gender;
    }

    const updated = repo.merge(profile, dto);

    return { updated, message: 'Profile actualizado correctamente' };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validateImage } from 'src/module/business/helper/file.helper';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { User } from 'src/module/users/entities/user.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateProfileAdminDto } from '../dto/profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Profile } from '../entities/profile.entity';
import { processProfileImage } from '../helper/profile-file.helper';

@Injectable()
export class ProfileService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(dto: CreateProfileAdminDto) {
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
  async findOne(userId: number) {
    const profile = await this.dataSource.getRepository(Profile).findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Profile no encontrado');

    return profile;
  }
  async findOneByAdmin(id: number) {
    const profile = await this.dataSource.getRepository(Profile).findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Profile no encontrado');

    return profile;
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const where: FindOptionsWhere<Profile> = {};

    const [data, total] = await this.profileRepository.findAndCount({
      where,
      relations: ['user', 'gender'],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: {
        createdAt: 'DESC',
      },
    });

    const lastPage = Math.ceil(total / safeLimit);

    return {
      data,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        lastPage,
        hasNextPage: safePage < lastPage,
      },
    };
  }
  private removeFile = (filename: string): void => {
    const filePath = path.join('./uploads/profile', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };
  async update(id: number, dto: UpdateProfileDto, file?: Express.Multer.File) {
    const profile = await this.findOneByAdmin(id);

    this.profileRepository.merge(profile, dto);

    if (dto.genderId) {
      const gender = await this.dataSource.getRepository(Gender).findOne({
        where: { id: dto.genderId },
      });

      if (!gender) throw new NotFoundException('Gender no encontrado');

      profile.gender = gender;
    }

    if (file) {
      validateImage(file, 'profileImage');

      processProfileImage(profile, file, this.removeFile);
    }

    try {
      return await this.profileRepository.save(profile);
    } catch (error) {
      if (file) this.removeFile(file.filename);
      throw error;
    }
  }
}

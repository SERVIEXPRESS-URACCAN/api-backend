import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validateImage } from 'src/module/business/helper/file.helper';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { DataSource, Repository } from 'typeorm';
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
      relations: ['user', 'gender'],
    });

    if (!profile) throw new NotFoundException('Profile no encontrado');

    return profile;
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const qb = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.gender', 'gender');

    if (search) {
      qb.andWhere(
        `(LOWER(profile.name) LIKE LOWER(:search) OR LOWER(profile.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))`,
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('profile.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

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

    if (dto.cellphone) {
      const existingProfile = await this.profileRepository.findOne({
        where: { cellphone: dto.cellphone.trim() },
        withDeleted: true,
      });
      if (existingProfile && existingProfile.id !== id) {
        throw new ConflictException({
          field: 'cellphone',
          message: 'El teléfono ya está en uso',
        });
      }
    }

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

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Mandadero } from '../entities/mandadero.entity';
import { User } from 'src/module/users/entities/user.entity';
import { MandaderoStatusService } from './mandadero-status.service';
import { MandaderoPolicyService } from './mandadero-policy.service';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { CreateMandaderoDto } from '../dto/create-mandadero.dto';
import { validateFile } from 'src/common/helper/validationFiles.helper';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { deleteFile } from 'src/common/helper/removeOldImage.helper';
import { FilterMandaderoDto } from '../dto/mandadero-filter.dto';
import { updateImage } from 'src/common/helper/updateImage.helper';

@Injectable()
export class MandaderoService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Mandadero)
    private readonly mandaderoRepository: Repository<Mandadero>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly statusService: MandaderoStatusService,
    private readonly policy: MandaderoPolicyService,
  ) {}

  async approve(id: number) {
    return this.statusService.approve(id);
  }

  async reject(id: number) {
    return this.statusService.reject(id);
  }

  async updateMyAvailability(available: boolean, user: AuthUser) {
    return this.statusService.updateMyAvailability(available, user);
  }

  async updateAvailabilityById(id: number, available: boolean) {
    return this.statusService.updateAvailabilityById(id, available);
  }

  async updateActive(id: number, isActive: boolean) {
    return this.statusService.updateActive(id, isActive);
  }

  async create(dto: CreateMandaderoDto, file: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!file) {
        throw new BadRequestException('Identification image is required');
      }

      validateFile(file, 'Identification image');

      const user = await queryRunner.manager.findOne(User, {
        where: { id: dto.user },
        relations: ['mandadero'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.mandadero) {
        throw new BadRequestException('User already has a mandadero profile');
      }

      const mandadero = queryRunner.manager.create(Mandadero, {
        available: false,
        isActive: false,
        status: ApprovalStatus.PENDING,
        user,
        imageIdentification: file.filename,
      });

      const saved = await queryRunner.manager.save(mandadero);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (file) {
        deleteFile(file.filename, 'mandaderos');
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: FilterMandaderoDto) {
    const { page = 1, limit = 10, status, available, userId } = query;

    const safeLimit = Math.max(1, Math.min(limit, 50));
    const safePage = Math.max(1, page);

    const qb = this.mandaderoRepository
      .createQueryBuilder('mandadero')
      .leftJoinAndSelect('mandadero.user', 'user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('mandadero.motorcycle', 'motorcycle');

    if (status) {
      qb.andWhere('mandadero.status = :status', { status });
    }

    if (available !== undefined) {
      qb.andWhere('mandadero.available = :available', { available });
    }

    if (userId) {
      qb.andWhere('user.id = :userId', { userId });
    }

    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [data, total] = await qb.getManyAndCount();

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

  async findOne(id: number, user: AuthUser) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { id },
      relations: [
        'user',
        'user.userRoles',
        'user.userRoles.role',
        'motorcycle',
      ],
    });

    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    const isAdmin = user.roles?.includes('admin');
    const isOwner = mandadero.user.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new BadRequestException('Access denied');
    }

    return mandadero;
  }

  async remove(id: number) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });

    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    return this.mandaderoRepository.softDelete(id);
  }

  async updateFile(id: number, file: Express.Multer.File, user: AuthUser) {
    const mandadero = await this.findOne(id, user);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.policy.validateOwner(mandadero, user.id);

    if (mandadero.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot update file of an approved mandadero',
      );
    }

    validateFile(file, 'Identification image');

    mandadero.imageIdentification = updateImage(
      file,
      mandadero.imageIdentification,
      'mandaderos',
    );

    return this.mandaderoRepository.save(mandadero);
  }

  async findMine(user: AuthUser) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { user: { id: user.id } },
      relations: [
        'user',
        'user.userRoles',
        'user.userRoles.role',
        'motorcycle',
      ],
    });

    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    return mandadero;
  }
}

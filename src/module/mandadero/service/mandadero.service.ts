import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mandadero } from '../entities/mandadero.entity';
import { MandaderoStatusService } from './mandadero-status.service';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

import { FilterMandaderoDto } from '../dto/mandadero-filter.dto';

@Injectable()
export class MandaderoService {
  constructor(
    @InjectRepository(Mandadero)
    private readonly mandaderoRepository: Repository<Mandadero>,

    private readonly statusService: MandaderoStatusService,
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

    qb.orderBy('mandadero.id', 'DESC');

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

  async findOne(id: number) {
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

    return mandadero;
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

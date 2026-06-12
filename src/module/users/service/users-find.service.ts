import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersServiceFind {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string, withDeleted = false) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .addSelect('user.refreshToken')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('user.email = :email', { email });

    if (withDeleted) {
      query.withDeleted();
    }

    return query.getOne();
  }
  async findOneWithRoles(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
  }
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: User[]; pagination: object }> {
    const { page = 1, limit = 10 } = paginationDto;
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.userRepository.findAndCount({
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

  async findAvailableForOwner() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.owner', 'owner')
      .where('owner.id IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'owner',
        'mandadero',
        'profile',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
  async findOneWithDeleted(email: string) {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }
}

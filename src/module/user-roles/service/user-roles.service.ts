import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../entities/user-roles.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { User } from 'src/module/users/entities/user.entity';
import { AssignRoleDto } from '../dto/user-roles.dto';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserRole)
    private readonly userrolesRepository: Repository<UserRole>,
  ) {}

  async assignRole(dto: AssignRoleDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: dto.userId },
      });

      const role = await queryRunner.manager.findOne(Roles, {
        where: { id: dto.roleId },
      });

      if (!user || !role) {
        throw new NotFoundException();
      }

      const existing = await queryRunner.manager.findOne(UserRole, {
        where: {
          user: { id: dto.userId },
          role: { id: dto.roleId },
        },
        withDeleted: true,
      });

      if (existing) {
        if (existing.deletedAt) {
          await queryRunner.manager.restore(UserRole, existing.id);
        } else {
          throw new BadRequestException('El usuario ya tiene este rol');
        }
      } else {
        const userRole = queryRunner.manager.create(UserRole, {
          user,
          role,
        });

        await queryRunner.manager.save(userRole);
      }

      await queryRunner.commitTransaction();

      return { message: 'Rol asignado correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(userId: number, roleId: number) {
    const relationUserRole = await this.dataSource
      .getRepository(UserRole)
      .findOne({
        where: {
          user: { id: userId },
          role: { id: roleId },
        },
        relations: ['user', 'role'],
      });

    if (!relationUserRole) {
      throw new NotFoundException('Relación no encontrada');
    }

    return relationUserRole;
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const where: FindOptionsWhere<UserRole> = {};

    const [data, total] = await this.userrolesRepository.findAndCount({
      where,
      relations: ['user', 'role'],
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

  async removeRole(dto: AssignRoleDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const relation = await queryRunner.manager.findOne(UserRole, {
        where: {
          user: { id: dto.userId },
          role: { id: dto.roleId },
        },
      });

      if (!relation) {
        throw new BadRequestException('El usuario no tiene este rol');
      }

      await queryRunner.manager.softDelete(UserRole, relation.id);

      await queryRunner.commitTransaction();

      return { message: 'Rol eliminado correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRolesByUser(userId: number) {
    const relations = await this.dataSource.getRepository(UserRole).find({
      where: {
        user: { id: userId },
      },
      relations: ['role'],
    });

    return relations.map((r) => r.role);
  }
}

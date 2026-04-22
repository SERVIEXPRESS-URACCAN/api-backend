import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../entities/user-roles.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { User } from 'src/module/users/entities/user.entity';
import { AssignRoleDto } from '../dto/user-roles.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRolesService {
  constructor(private readonly dataSource: DataSource) {}

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
  async findAll() {
    const relations = await this.dataSource.getRepository(UserRole).find({
      relations: ['user', 'role'],
      order: {
        id: 'DESC',
      },
    });

    return relations;
  }
}

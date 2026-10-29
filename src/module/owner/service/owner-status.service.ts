import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Owner } from '../entities/owner.entity';
import { User } from 'src/module/users/entities/user.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';

@Injectable()
export class OwnerStatusService {
  constructor(private readonly dataSource: DataSource) {}

  async approve(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const owner = await manager
        .getRepository(Owner)
        .createQueryBuilder('owner')
        .where('owner.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!owner) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (owner.status !== ApprovalStatus.PENDING) {
        throw new BadRequestException(
          'Solo se pueden aprobar solicitudes pendientes',
        );
      }

      const ownerWithUser = await manager.findOne(Owner, {
        where: { id: owner.id },
        relations: {
          user: true,
        },
      });

      if (!ownerWithUser?.user) {
        throw new NotFoundException('Usuario asociado no encontrado');
      }

      const user = await manager.findOne(User, {
        where: { id: ownerWithUser.user.id },
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user) {
        throw new NotFoundException('El usuario no existe');
      }

      const hasOwnerRole = user.userRoles.some(
        (userRole) => userRole.role.name.toLowerCase() === 'owner',
      );

      if (!hasOwnerRole) {
        const ownerRole = await manager.findOne(Roles, {
          where: { name: 'owner' },
        });

        if (!ownerRole) {
          throw new NotFoundException('Rol owner no existe');
        }

        const userRole = manager.create(UserRole, {
          user: { id: user.id },
          role: { id: ownerRole.id },
        });

        await manager.save(UserRole, userRole);
      }

      owner.status = ApprovalStatus.APPROVED;

      await manager.save(Owner, owner);

      return {
        message: 'Solicitud aprobada correctamente',
        ownerId: owner.id,
        status: owner.status,
      };
    });
  }

  async reject(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const owner = await manager
        .getRepository(Owner)
        .createQueryBuilder('owner')
        .where('owner.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!owner) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (owner.status !== ApprovalStatus.PENDING) {
        throw new BadRequestException(
          'Solo se pueden rechazar solicitudes pendientes',
        );
      }

      owner.status = ApprovalStatus.REJECTED;

      await manager.save(Owner, owner);

      return {
        message: 'Solicitud rechazada correctamente',
        ownerId: owner.id,
        status: owner.status,
      };
    });
  }
}

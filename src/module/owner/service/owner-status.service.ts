import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Owner } from '../entities/owner.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';

@Injectable()
export class OwnerStatusService {
  constructor(private readonly dataSource: DataSource) {}

  async approve(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const owner = await manager.findOne(Owner, {
        where: { id },
        relations: {
          user: {
            userRoles: {
              role: true,
            },
          },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!owner) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (owner.status !== ApprovalStatus.PENDING) {
        throw new BadRequestException(
          'Solo se pueden aprobar solicitudes pendientes',
        );
      }

      const role = await manager.findOne(Roles, {
        where: { name: 'owner' },
      });

      if (!role) {
        throw new NotFoundException('Rol owner no encontrado');
      }

      const alreadyHasRole = owner.user.userRoles.some(
        (ur) => ur.role?.name.toLowerCase() === 'owner',
      );

      if (!alreadyHasRole) {
        const userRole = manager.create(UserRole, {
          user: owner.user,
          role,
        });

        await manager.save(userRole);
      }

      owner.status = ApprovalStatus.APPROVED;
      await manager.save(owner);

      return {
        message: 'Solicitud aprobada correctamente',
        ownerId: owner.id,
        status: owner.status,
      };
    });
  }

  async reject(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const owner = await manager.findOne(Owner, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!owner) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (owner.status !== ApprovalStatus.PENDING) {
        throw new BadRequestException(
          'Solo se pueden rechazar solicitudes pendientes',
        );
      }

      owner.status = ApprovalStatus.REJECTED;
      await manager.save(owner);

      return {
        message: 'Solicitud rechazada correctamente',
        ownerId: owner.id,
        status: owner.status,
      };
    });
  }
}

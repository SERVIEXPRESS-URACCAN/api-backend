import { InjectRepository } from '@nestjs/typeorm';
import { Mandadero } from '../entities/mandadero.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import { MandaderoPolicyService } from './mandadero-policy.service';

@Injectable()
export class MandaderoStatusService {
  constructor(
    @InjectRepository(Mandadero)
    private readonly mandaderoRepository: Repository<Mandadero>,
    private readonly dataSource: DataSource,
    private readonly policy: MandaderoPolicyService,
  ) {}

  async approve(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mandadero = await this.findMandaderoOrFail(id, queryRunner.manager);

      this.policy.validateApprovalStatus(mandadero);

      mandadero.status = ApprovalStatus.APPROVED;
      mandadero.motorcycle.status = ApprovalStatus.APPROVED;
      mandadero.isActive = true;
      mandadero.available = false;

      await this.assignMandaderoRole(mandadero, queryRunner.manager);

      await queryRunner.manager.save(mandadero.motorcycle);
      await queryRunner.manager.save(mandadero);

      await queryRunner.commitTransaction();

      return {
        message: 'Mandadero and Motorcycle approved successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reject(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mandadero = await this.findMandaderoOrFail(id, queryRunner.manager);

      this.policy.validateRejection(mandadero);

      mandadero.status = ApprovalStatus.REJECTED;
      mandadero.motorcycle.status = ApprovalStatus.REJECTED;

      mandadero.isActive = false;
      mandadero.available = false;

      await queryRunner.manager.save(mandadero.motorcycle);
      await queryRunner.manager.save(mandadero);

      await queryRunner.commitTransaction();

      return {
        message: 'Mandadero and Motorcycle rejected successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateMyAvailability(available: boolean, user: AuthUser) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }

    this.policy.validateAvailabilityChange(mandadero);

    mandadero.available = available;

    return this.mandaderoRepository.save(mandadero);
  }

  async updateAvailabilityById(id: number, available: boolean) {
    const mandadero = await this.mandaderoRepository.findOneBy({ id });

    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }
    if (available && !mandadero.isActive)
      throw new BadRequestException('Only active mandaderos can be available');

    if (mandadero.status !== ApprovalStatus.APPROVED)
      throw new BadRequestException(
        'Only approved mandaderos can have their availability updated',
      );
    mandadero.available = available;

    return this.mandaderoRepository.save(mandadero);
  }

  async updateActive(id: number, isActive: boolean) {
    const mandadero = await this.mandaderoRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!mandadero) {
      throw new NotFoundException('Mandadero not found');
    }
    if (mandadero.status !== ApprovalStatus.APPROVED)
      throw new BadRequestException(
        'Only approved mandaderos can be activated/deactivated',
      );

    mandadero.isActive = isActive;

    if (!isActive) {
      mandadero.available = false;
    }
    return this.mandaderoRepository.save(mandadero);
  }

  private async findMandaderoOrFail(id: number, manager: EntityManager) {
    const mandadero = await manager.findOne(Mandadero, {
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

  private async assignMandaderoRole(
    mandadero: Mandadero,
    manager: EntityManager,
  ) {
    const role = await manager.findOne(Roles, {
      where: { name: 'mandadero' },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const alreadyHasRole = mandadero.user.userRoles.some(
      (ur: UserRole) => ur.role?.name === 'mandadero',
    );
    if (!alreadyHasRole) {
      const userRole = manager.create(UserRole, {
        user: mandadero.user,
        role,
      });
      await manager.save(userRole);
    }
  }
}

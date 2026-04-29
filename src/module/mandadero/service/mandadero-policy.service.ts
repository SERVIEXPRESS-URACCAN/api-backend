import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Mandadero } from '../entities/mandadero.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { User } from 'src/module/users/entities/user.entity';

@Injectable()
export class MandaderoPolicyService {
  canAccess(mandadero: Mandadero, user: AuthUser): void {
    const isAdmin = user.roles?.includes('admin');
    const isOwner = mandadero.user.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Access denied');
    }
  }

  validateCreate(user: User): void {
    if (user.mandadero) {
      throw new BadRequestException('User already has a mandadero profile');
    }
  }

  validateAvailabilityChange(mandadero: Mandadero): void {
    if (!mandadero.isActive) {
      throw new BadRequestException(
        'Cannot change availability of an inactive mandadero',
      );
    }

    if (mandadero.status !== ApprovalStatus.APPROVED) {
      throw new BadRequestException('Mandadero is not approved');
    }
  }

  validateApprovalStatus(mandadero: Mandadero): void {
    if (mandadero.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Mandadero is already approved');
    }

    if (mandadero.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Cannot approve a rejected mandadero');
    }

    if (!mandadero.motorcycle) {
      throw new BadRequestException('Motorcycle required before approval');
    }

    if (mandadero.motorcycle.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot approve because motorcycle is rejected',
      );
    }
    if (mandadero.motorcycle.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Motorcycle is already approved');
    }
  }

  validateRejection(mandadero: Mandadero): void {
    if (mandadero.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an approved mandadero');
    }

    if (mandadero.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Mandadero is already rejected');
    }
  }

  buildNewMandadero(user: User, image: string) {
    this.validateCreate(user);

    return {
      user,
      available: false,
      isActive: false,
      status: ApprovalStatus.PENDING,
      imageIdentification: image,
    };
  }
}

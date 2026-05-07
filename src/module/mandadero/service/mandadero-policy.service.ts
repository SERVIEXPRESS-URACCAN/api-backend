import { BadRequestException, Injectable } from '@nestjs/common';
import { Mandadero } from '../entities/mandadero.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { User } from 'src/module/users/entities/user.entity';

@Injectable()
export class MandaderoPolicyService {
  validateCreate(user: User): void {
    if (user.mandadero) {
      throw new BadRequestException('User already has a mandadero profile');
    }
  }

  validateAvailabilityChange(mandadero: Mandadero): void {
    if (!mandadero.isActive) {
      throw new BadRequestException(
        'Inactive mandadero cannot change availability',
      );
    }

    if (mandadero.status !== ApprovalStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved mandaderos can change availability',
      );
    }
  }

  validateApprovalStatus(mandadero: Mandadero): void {
    this.ensureNotApproved(mandadero);
    this.ensureNotRejected(mandadero);

    if (!mandadero.motorcycle) {
      throw new BadRequestException('Motorcycle required before approval');
    }

    if (mandadero.motorcycle.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Motorcycle is rejected');
    }
    if (mandadero.motorcycle.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Motorcycle already approved');
    }
  }

  validateRejection(mandadero: Mandadero): void {
    this.ensureNotApproved(mandadero);

    if (mandadero.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Mandadero already rejected');
    }
  }

  buildNewMandadero(user: User, image: string): Partial<Mandadero> {
    this.validateCreate(user);

    return {
      user,
      available: false,
      isActive: false,
      status: ApprovalStatus.PENDING,
      imageIdentification: image,
    };
  }

  private ensureNotApproved(mandadero: Mandadero) {
    if (mandadero.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Mandadero already approved');
    }
  }

  private ensureNotRejected(mandadero: Mandadero) {
    if (mandadero.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Rejected mandadero cannot be approved');
    }
  }
}

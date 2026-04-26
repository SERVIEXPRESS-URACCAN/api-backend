import { BadRequestException, Injectable } from '@nestjs/common';
import { Mandadero } from '../entities/mandadero.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';

@Injectable()
export class MandaderoPolicyService {
  validateApprovalStatus(mandadero: Mandadero) {
    if (mandadero.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Mandadero is already approved');
    }
    if (mandadero.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Cannot approve a rejected mandadero');
    }
    if (!mandadero.motorcycle) {
      throw new BadRequestException('Motorcycle required before approval');
    }
    if (mandadero.motorcycle?.status !== ApprovalStatus.APPROVED) {
      throw new BadRequestException('Motorcycle must be approved');
    }
  }
  validateRejection(mandadero: Mandadero) {
    if (mandadero.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an approved mandadero');
    }
    if (mandadero.status === ApprovalStatus.REJECTED) {
      throw new BadRequestException('Mandadero is already rejected');
    }
  }
  validateAvailabilityChange(mandadero: Mandadero) {
    if (!mandadero.isActive) {
      throw new BadRequestException(
        'Cannot change availability of an inactive mandadero',
      );
    }

    if (mandadero.status !== ApprovalStatus.APPROVED) {
      throw new BadRequestException('Mandadero is not approved');
    }
  }

  validateOwner(mandadero: Mandadero, userId: number) {
    if (mandadero.user.id !== userId) {
      throw new BadRequestException('You are not the owner of this mandadero');
    }
  }
}

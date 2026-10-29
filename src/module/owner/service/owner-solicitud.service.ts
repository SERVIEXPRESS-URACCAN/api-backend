import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Owner } from '../entities/owner.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';

@Injectable()
export class OwnerSolicitudService {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async findMySolicitud(authUser: AuthUser) {
    const owner = await this.ownerRepository.findOne({
      where: {
        user: { id: authUser.id },
      },
      relations: {
        business: {
          city: true,
        },
      },
    });

    if (!owner) {
      return null;
    }

    return {
      id: owner.id,
      status: owner.status,
      razonSocial: owner.razonSocial,
      business: owner.business
        ? {
            id: owner.business.id,
            name: owner.business.name,
            phone: owner.business.phone,
            address: owner.business.address,
            city: owner.business.city,
          }
        : null,
      createdAt: owner.createdAt,
    };
  }
}

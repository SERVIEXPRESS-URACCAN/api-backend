import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import * as path from 'node:path';

import { Owner } from '../entities/owner.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { City } from 'src/module/city/entities/city.entity';
import { User } from 'src/module/users/entities/user.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { validateImage } from '../helper/file.helper';

type OwnerFiles = {
  identificationCardImage?: Express.Multer.File[];
};

@Injectable()
export class OwnerSolicitudService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async create(dto: CreateOwnerDto, files: OwnerFiles, authUser: AuthUser) {
    const image = files?.identificationCardImage?.[0];

    if (!image) {
      throw new BadRequestException('La imagen de la cédula es obligatoria');
    }

    try {
      validateImage(image, 'identificationCardImage');

      return await this.dataSource.transaction(async (manager) => {
        const user = await manager.findOne(User, {
          where: { id: authUser.id },
        });

        if (!user) {
          throw new NotFoundException('Usuario no encontrado');
        }

        const existingOwner = await manager.findOne(Owner, {
          where: { user: { id: user.id } },
          relations: { business: true },
        });

        if (existingOwner && existingOwner.status !== ApprovalStatus.REJECTED) {
          throw new ConflictException(
            'Ya tienes una solicitud de Owner registrada',
          );
        }

        const city = await manager.findOne(City, {
          where: { id: dto.business.city },
        });

        if (!city) {
          throw new NotFoundException('Ciudad no encontrada');
        }

        if (existingOwner) {
          const previousImage = existingOwner.identificationCardImage;

          existingOwner.razonSocial = dto.razonSocial?.trim() || null;
          existingOwner.identificationCardImage = image.filename;
          existingOwner.status = ApprovalStatus.PENDING;

          const business = existingOwner.business;

          if (!business) {
            throw new NotFoundException('Negocio asociado no encontrado');
          }

          business.name = dto.business.name;
          business.phone = dto.business.phone;
          business.address = dto.business.address;
          business.city = city;

          await manager.save(business);
          await manager.save(existingOwner);

          return {
            message: 'Solicitud reenviada correctamente',
            ownerId: existingOwner.id,
            status: ApprovalStatus.PENDING,
            previousImage,
          };
        }

        const owner = manager.create(Owner, {
          user,
          razonSocial: dto.razonSocial?.trim() || null,
          identificationCardImage: image.filename,
          status: ApprovalStatus.PENDING,
        });

        const savedOwner = await manager.save(owner);

        const business = manager.create(Business, {
          name: dto.business.name,
          phone: dto.business.phone,
          address: dto.business.address,
          city,
          owner: savedOwner,
        });

        await manager.save(business);

        return {
          message: 'Solicitud creada correctamente',
          ownerId: savedOwner.id,
          status: ApprovalStatus.PENDING,
          previousImage: null,
        };
      });
    } catch (error) {
      await this.removeImage(image.filename);
      throw error;
    }
  }

  async findMySolicitud(authUser: AuthUser) {
    const owner = await this.ownerRepository.findOne({
      where: { user: { id: authUser.id } },
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

  private async removeImage(filename: string) {
    const filePath = path.resolve('uploads/owners', path.basename(filename));

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { Owner } from '../entities/owner.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { City } from 'src/module/city/entities/city.entity';
import { User } from 'src/module/users/entities/user.entity';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { validateImage } from '../helper/file.helper';
import { Logger } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import * as path from 'node:path';
import { formatPhone } from '../helper/phone.helper';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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
  private readonly logger = new Logger(OwnerSolicitudService.name);

  private async removeFile(filename: string): Promise<void> {
    const safeFilename = path.basename(filename);

    const filePath = path.resolve('uploads/owners', safeFilename);

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`No se pudo eliminar el archivo ${safeFilename}`);
      }
    }
  }
  private handleDBException(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        code?: string;
        constraint?: string;
        detail?: string;
      };

      if (driverError.code === '23505') {
        if (
          driverError.constraint?.includes('phone') ||
          driverError.detail?.includes('(phone)=')
        ) {
          throw new ConflictException(
            'Este número de teléfono ya está registrado en otro negocio',
          );
        }

        throw new ConflictException('Ya existe un registro con estos datos');
      }
    }

    this.logger.error(
      'Error inesperado al gestionar la solicitud de Owner',
      error instanceof Error ? error.stack : String(error),
    );

    throw new InternalServerErrorException('No se pudo completar la solicitud');
  }
  async findAllSolicitudes(
    paginationDto: PaginationDto,
    status: ApprovalStatus = ApprovalStatus.PENDING,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.ownerRepository.findAndCount({
      where: { status },
      relations: {
        user: { profile: true },
        business: { city: true },
      },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
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
  async create(dto: CreateOwnerDto, files: OwnerFiles, authUser: AuthUser) {
    const image = files?.identificationCardImage?.[0];
    let committed = false;

    try {
      if (!image) {
        throw new BadRequestException('La imagen de la cédula es obligatoria');
      }

      validateImage(image, 'identificationCardImage');

      const phone = formatPhone(dto.business.phone);

      const result = await this.dataSource.transaction(async (manager) => {
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

        const existingBusiness = await manager.findOne(Business, {
          where: { phone },
          relations: { owner: true },
        });

        if (
          existingBusiness &&
          existingBusiness.owner?.id !== existingOwner?.id
        ) {
          throw new ConflictException(
            'Este número de teléfono ya está registrado en otro negocio',
          );
        }

        if (existingOwner) {
          const business = existingOwner.business;

          if (!business) {
            throw new NotFoundException('Negocio asociado no encontrado');
          }

          const previousImage = existingOwner.identificationCardImage;

          existingOwner.razonSocial = dto.razonSocial?.trim() || null;

          existingOwner.identificationCardImage = image.filename;

          existingOwner.status = ApprovalStatus.PENDING;

          business.name = dto.business.name.trim();
          business.phone = phone;
          business.address = dto.business.address.trim();
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
          name: dto.business.name.trim(),
          phone,
          address: dto.business.address.trim(),
          city,
          owner: savedOwner,
        });

        await manager.save(business);

        return {
          message: 'Solicitud creada correctamente',
          ownerId: savedOwner.id,
          status: ApprovalStatus.PENDING,
          previousImage: null as string | null,
        };
      });

      committed = true;

      if (result.previousImage && result.previousImage !== image.filename) {
        await this.removeFile(result.previousImage);
      }

      return {
        message: result.message,
        ownerId: result.ownerId,
        status: result.status,
      };
    } catch (error) {
      if (!committed && image?.filename) {
        await this.removeFile(image.filename);
      }

      this.handleDBException(error);
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
}

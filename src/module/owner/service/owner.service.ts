import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'node:fs/promises';
import * as path from 'node:path';
import {
  Brackets,
  DataSource,
  FindOptionsWhere,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { Business } from 'src/module/business/entities/business.entity';
import { City } from 'src/module/city/entities/city.entity';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import { User } from 'src/module/users/entities/user.entity';

import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Owner } from '../entities/owner.entity';
import { validateImage } from '../helper/file.helper';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';

type OwnerFiles = {
  identificationCardImage?: Express.Multer.File[];
};

@Injectable()
export class OwnerService {
  private readonly logger = new Logger(OwnerService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async findAll(paginationDto: PaginationDto & { status?: ApprovalStatus }) {
    const { page = 1, limit = 10, search } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const qb = this.ownerRepository
      .createQueryBuilder('owner')
      .leftJoinAndSelect('owner.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.gender', 'gender')
      .leftJoinAndSelect('owner.business', 'business');

    if (paginationDto.status) {
      qb.andWhere('owner.status = :status', {
        status: paginationDto.status,
      });
    }

    const term = search?.trim();

    if (term) {
      const escapedTerm = term.replace(/[\\%_]/g, '\\$&');

      const pattern = `%${escapedTerm}%`;

      qb.andWhere(
        new Brackets((query) => {
          query
            .where('profile.name ILIKE :term')
            .orWhere('profile.lastName ILIKE :term')
            .orWhere(
              `CONCAT_WS(' ', profile.name, profile.lastName) ILIKE :term`,
            )
            .orWhere('owner.razonSocial ILIKE :term')
            .orWhere('business.name ILIKE :term');
        }),
        { term: pattern },
      );
    }

    const [data, total] = await qb
      .orderBy('owner.createdAt', 'DESC')
      .addOrderBy('owner.id', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

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

  async findOne(userId: number): Promise<Owner> {
    return this.findOwnerOrFail({ user: { id: userId } });
  }

  async findOneByAdmin(id: number): Promise<Owner> {
    return this.findOwnerOrFail({ id }, true);
  }

  async create(
    createOwnerDto: CreateOwnerDto,
    authUser: AuthUser,
    files?: OwnerFiles,
  ) {
    const image = files?.identificationCardImage?.[0];

    try {
      if (!image) {
        throw new BadRequestException('La imagen de la cédula es obligatoria');
      }

      validateImage(image, 'identificationCardImage');

      const isAdmin = authUser.roles?.some(
        (role) => role.toLowerCase() === 'admin',
      );

      const userId =
        isAdmin && createOwnerDto.user ? createOwnerDto.user : authUser.id;

      return await this.dataSource.transaction(async (manager) => {
        const user = await manager.findOne(User, {
          where: { id: userId },
          relations: ['userRoles', 'userRoles.role'],
        });

        if (!user) {
          throw new NotFoundException('El usuario no existe');
        }

        const existingOwner = await manager.findOne(Owner, {
          where: { user: { id: userId } },
        });

        if (existingOwner) {
          throw new BadRequestException('Este usuario ya tiene un owner');
        }

        const city = await manager.findOne(City, {
          where: {
            id: createOwnerDto.business.city,
          },
        });

        if (!city) {
          throw new NotFoundException('Ciudad no encontrada');
        }

        const owner = manager.create(Owner, {
          razonSocial: createOwnerDto.razonSocial,
          user: { id: userId },
          identificationCardImage: image.filename,
          status: ApprovalStatus.APPROVED,
        });

        await manager.save(owner);

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

        const business = manager.create(Business, {
          ...createOwnerDto.business,
          owner,
          city,
        });

        await manager.save(business);

        return {
          message: 'Owner y negocio creados correctamente',
          owner,
          business,
        };
      });
    } catch (error) {
      if (image?.filename) {
        await this.removeFile(image.filename);
      }

      this.handleDBException(error);
    }
  }

  async updateMe(
    userId: number,
    dto: UpdateOwnerDto,
    files?: OwnerFiles,
  ): Promise<Owner> {
    return this.updateOwner(
      { user: { id: userId } },
      dto,
      files?.identificationCardImage?.[0],
    );
  }

  async updateByAdmin(
    ownerId: number,
    dto: UpdateOwnerDto,
    files?: OwnerFiles,
  ): Promise<Owner> {
    return this.updateOwner(
      { id: ownerId },
      dto,
      files?.identificationCardImage?.[0],
    );
  }

  private async findOwnerOrFail(
    where: FindOptionsWhere<Owner>,
    includeProducts = false,
  ): Promise<Owner> {
    const owner = await this.ownerRepository.findOne({
      where,
      relations: {
        user: {
          profile: {
            gender: true,
          },
        },
        business: includeProducts ? { products: true } : true,
      },
    });

    if (!owner) {
      throw new NotFoundException('Propietario no encontrado');
    }

    return owner;
  }

  private async updateOwner(
    where: FindOptionsWhere<Owner>,
    dto: UpdateOwnerDto,
    image?: Express.Multer.File,
  ): Promise<Owner> {
    let previousImage: string | null | undefined;

    try {
      if (image) {
        validateImage(image, 'identificationCardImage');
      }

      const savedOwner = await this.dataSource.transaction(async (manager) => {
        const owner = await manager.findOne(Owner, {
          where,
          relations: {
            user: {
              profile: {
                gender: true,
              },
            },
            business: true,
          },
        });

        if (!owner) {
          throw new NotFoundException('Propietario no encontrado');
        }

        if (dto.razonSocial !== undefined) {
          if (typeof dto.razonSocial !== 'string' || !dto.razonSocial.trim()) {
            throw new BadRequestException('La razón social no puede vaciarse');
          }

          owner.razonSocial = dto.razonSocial.trim();
        }

        if (dto.email) {
          owner.user.email = dto.email;
        }

        if (dto.profile) {
          const profile = owner.user.profile;

          profile.name = dto.profile.name ?? profile.name;

          profile.lastName = dto.profile.lastName ?? profile.lastName;

          profile.cellphone = dto.profile.cellphone ?? profile.cellphone;

          if (dto.profile.genderId != null) {
            const gender = await manager.findOne(Gender, {
              where: {
                id: dto.profile.genderId,
              },
            });

            if (!gender) {
              throw new NotFoundException('Gender no encontrado');
            }

            profile.gender = gender;
          }
        }

        if (dto.businessName && owner.business) {
          owner.business.name = dto.businessName;
        }

        if (image) {
          previousImage = owner.identificationCardImage;

          owner.identificationCardImage = image.filename;
        }

        await manager.save(owner.user.profile);

        await manager.save(owner.user);

        if (owner.business) {
          await manager.save(owner.business);
        }

        return manager.save(owner);
      });

      if (image && previousImage && previousImage !== image.filename) {
        await this.removeFile(previousImage);
      }

      return savedOwner;
    } catch (error) {
      if (image?.filename) {
        await this.removeFile(image.filename);
      }

      this.handleDBException(error);
    }
  }

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
      };

      if (driverError?.code === '23505') {
        throw new ConflictException('El registro ya existe');
      }
    }

    this.logger.error('Error inesperado al gestionar propietarios');

    throw new InternalServerErrorException('No se pudo completar la operación');
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { User } from 'src/module/users/entities/user.entity';
import {
  DataSource,
  FindOptionsWhere,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateOwnerDto } from '../dto/create-owner.dto';
// import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Owner } from '../entities/owner.entity';
import { validateImage } from '../helper/file.helper';
// import { processImage } from '../helper/owner-file.helper';

@Injectable()
export class OwnerService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async findAll(paginationDto: PaginationDto, authUser: AuthUser) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const where: FindOptionsWhere<Owner> = {
      user: { id: authUser.id },
    };

    const [data, total] = await this.ownerRepository.findAndCount({
      where,
      relations: ['user'],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: {
        createdAt: 'DESC',
      },
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

  async findOne(userId: number) {
    const owner = await this.dataSource.getRepository(Owner).findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    if (!owner) {
      throw new NotFoundException('Propietario no encontrado');
    }

    return owner;
  }

  async create(
    createOwnerDto: CreateOwnerDto,
    authUser: AuthUser,
    files?: {
      identificationCardImage?: Express.Multer.File[];
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const identificationCardImage = files?.identificationCardImage?.[0];

    try {
      // if (!identificationCardImage) {
      //   throw new BadRequestException('La imagen de la cédula es obligatoria');
      // }

      validateImage(identificationCardImage, 'identificationCardImage');

      const existingOwner = await queryRunner.manager.findOne(Owner, {
        where: { user: { id: authUser.id } },
      });

      if (existingOwner) {
        throw new BadRequestException('Este usuario ya tiene un owner');
      }

      const user = { id: authUser.id } as User;

      const owner = queryRunner.manager.create(Owner, {
        ...createOwnerDto,
        user,
        // identificationCardImage: identificationCardImage.filename,
      });

      const saved = await queryRunner.manager.save(owner);

      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (identificationCardImage)
        this.removeFile(identificationCardImage.filename);

      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  // async update(
  //   id: number,
  //   updateOwnerDto: UpdateOwnerDto,
  //   files?: {
  //     identificationCardImage?: Express.Multer.File[];
  //   },
  // ) {
  //   const owner = await this.findOne(id);

  //   this.ownerRepository.merge(owner, updateOwnerDto);

  //   const identificationCardImage = files?.identificationCardImage?.[0];

  //   if (identificationCardImage) {
  //     validateImage(identificationCardImage, 'identificationCardImage');
  //   }

  //   processImage(
  //     owner,
  //     identificationCardImage,
  //     'identificationCardImage',
  //     this.removeFile.bind(this),
  //   );

  //   try {
  //     return await this.ownerRepository.save(owner);
  //   } catch (error) {
  //     if (identificationCardImage)
  //       this.removeFile(identificationCardImage.filename);
  //     this.handleDBException(error);
  //   }
  // }

  private removeFile(filename: string) {
    const filePath = path.join('./uploads/owners', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private handleDBException(error: unknown) {
    console.log(error);
    if (error instanceof QueryFailedError) {
      const err = error as QueryFailedError & {
        driverError: { code?: string; detail?: string };
      };

      if (err.driverError?.code === '23505') {
        throw new BadRequestException('Dato duplicado');
      }
    }
    throw new InternalServerErrorException('Error en la base de datos');
  }
}

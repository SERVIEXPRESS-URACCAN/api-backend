import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Owner } from 'src/module/owner/entities/owner.entity';
import {
  DataSource,
  FindOptionsWhere,
  QueryFailedError,
  QueryRunner,
  Repository,
} from 'typeorm';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { Business } from '../entities/business.entity';
import { formatPhone } from '../helper/phone.helper';
import { BusinessImageService } from './business-image.service';
import { BusinessRelationsService } from './business-relations.service';
@Injectable()
export class BusinessService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,

    private readonly businessImageService: BusinessImageService,

    private readonly businessRelationsService: BusinessRelationsService,
  ) {}

  async findAll(paginationDto: PaginationDto, cityId?: number) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const where: FindOptionsWhere<Business> = {};

    if (cityId !== undefined) {
      where.city = { id: cityId };
    }

    const [data, total] = await this.businessRepository.findAndCount({
      where,
      relations: ['owner', 'categories', 'city'],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: {
        createdAt: 'DESC',
      },
    });

    const lastPage = Math.ceil(total / safeLimit);

    return {
      data,
      meta: {
        total,
        page: safePage,
        lastPage,
        hasNextPage: safePage < lastPage,
      },
    };
  }

  async findOneByAdmin(id: number) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner', 'categories', 'city'],
    });

    if (!business) {
      throw new NotFoundException(`El negocio con id ${id} no existe`);
    }

    return business;
  }

  async findOne(userId: number) {
    const business = await this.dataSource.getRepository(Business).findOne({
      where: {
        owner: {
          user: {
            id: userId,
          },
        },
      },
      relations: ['owner', 'owner.user', 'categories', 'city'],
    });

    if (!business) {
      throw new NotFoundException(
        `El negocio para el usuario ${userId} no existe`,
      );
    }

    return business;
  }

  private async updateBusiness(
    queryRunner: QueryRunner,
    business: Business,
    updateBusinessDto: UpdateBusinessDto,
    files?: {
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    },
  ) {
    const {
      businessCategories,
      city: cityId,
      phone,
      ...rest
    } = updateBusinessDto;

    await this.businessRelationsService.handleCategories(
      queryRunner.manager,
      business,
      businessCategories,
    );

    await this.businessRelationsService.handleCity(
      queryRunner.manager,
      business,
      cityId,
    );

    if (phone) {
      business.phone = formatPhone(phone);
    }

    queryRunner.manager.merge(Business, business, rest);

    this.businessImageService.handleImages(business, files);

    return await queryRunner.manager.save(business);
  }

  async update(id: number, dto: UpdateBusinessDto, files?) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const business = await queryRunner.manager.findOne(Business, {
        where: { id },
        relations: ['categories', 'city'],
      });

      if (!business) {
        throw new NotFoundException(`Negocio con id ${id} no existe`);
      }

      const saved = await this.updateBusiness(
        queryRunner,
        business,
        dto,
        files,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.businessImageService.cleanupOnError(files);
      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async updateMyBusiness(userId: number, dto: UpdateBusinessDto, files?) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const business = await queryRunner.manager.findOne(Business, {
        where: {
          owner: {
            user: { id: userId },
          },
        },
        relations: ['categories', 'city', 'owner', 'owner.user'],
      });

      if (!business) {
        throw new NotFoundException(`No tienes un negocio asociado`);
      }

      const saved = await this.updateBusiness(
        queryRunner,
        business,
        dto,
        files,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.businessImageService.cleanupOnError(files);
      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }
  private handleDBException(error: unknown) {
    if (error instanceof QueryFailedError) {
      const err = error as QueryFailedError & {
        driverError: { code?: string; detail?: string };
      };

      if (err.driverError?.code === '23505') {
        throw new BadRequestException('Dato duplicado');
      }
    }
    throw new InternalServerErrorException('Error en el servidor');
  }
}

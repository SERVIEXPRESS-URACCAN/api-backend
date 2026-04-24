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
  Repository,
} from 'typeorm';
import { CreateBusinessDto } from '../dto/create-business.dto';
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

  async findOne(id: number) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner', 'categories', 'city'],
    });

    if (!business) {
      throw new NotFoundException(`El negocio con id ${id} no existe`);
    }

    return business;
  }

  async create(createBusinessDto: CreateBusinessDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { city: cityId, phone, ...rest } = createBusinessDto;

      const city = await this.businessRelationsService.getCity(
        queryRunner.manager,
        cityId,
      );
      const business = queryRunner.manager.create(Business, {
        ...rest,
        city,
        phone: formatPhone(phone),
      });

      const saved = await queryRunner.manager.save(business);

      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
    files?: {
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    },
  ) {
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

      const saved = await queryRunner.manager.save(business);

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

  async remove(id: number) {
    const business = await this.findOne(id);

    await this.businessRepository.softDelete(id);

    this.businessImageService.removeBusinessImages(business);

    return { success: true };
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

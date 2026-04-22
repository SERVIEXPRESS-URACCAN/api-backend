import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CategoriesBusiness } from 'src/module/categories-business/entities/categories-business.entity';
import { City } from 'src/module/city/entities/city.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { Business } from '../entities/business.entity';
import { processImage } from '../helper/business-file.helper';
import { validateImage } from '../helper/file.helper';
import { formatPhone } from '../helper/phone.helper';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger('BusinessService');
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,

    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(CategoriesBusiness)
    private readonly categoriesRepository: Repository<CategoriesBusiness>,
  ) {}

  findAll() {
    return this.businessRepository.find({
      relations: ['owner', 'categories', 'city'],
    });
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

      const city = await queryRunner.manager.findOne(City, {
        where: { id: cityId },
      });

      if (!city) {
        throw new NotFoundException('Ciudad no existe');
      }

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

      if (businessCategories) {
        const uniqueCategories = [...new Set(businessCategories)];

        const categories = await queryRunner.manager.findBy(
          CategoriesBusiness,
          {
            id: In(uniqueCategories),
          },
        );

        if (categories.length !== uniqueCategories.length) {
          throw new NotFoundException('Algunas categorías no existen');
        }

        business.categories = categories;
      }

      if (cityId) {
        const city = await queryRunner.manager.findOne(City, {
          where: { id: cityId },
        });

        if (!city) {
          throw new NotFoundException('Ciudad no existe');
        }

        business.city = city;
      }

      if (phone) {
        business.phone = formatPhone(phone);
      }

      queryRunner.manager.merge(Business, business, rest);

      const logoImage = files?.logoImage?.[0];
      const bannerImage = files?.bannerImage?.[0];

      if (logoImage) validateImage(logoImage, 'logoImage');
      if (bannerImage) validateImage(bannerImage, 'bannerImage');

      processImage(
        business,
        logoImage,
        'logoImage',
        this.removeFile.bind(this),
      );

      processImage(
        business,
        bannerImage,
        'bannerImage',
        this.removeFile.bind(this),
      );

      const saved = await queryRunner.manager.save(business);

      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const logoImage = files?.logoImage?.[0];
      const bannerImage = files?.bannerImage?.[0];

      if (logoImage) this.removeFile(logoImage.filename);
      if (bannerImage) this.removeFile(bannerImage.filename);

      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const business = await this.findOne(id);

    const result = await this.businessRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (business.logoImage) {
      this.removeFile(business.logoImage);
    }

    if (business.bannerImage) {
      this.removeFile(business.bannerImage);
    }

    return { message: 'Eliminado correctamente' };
  }

  private removeFile(filename: string) {
    const filePath = path.join('./uploads/business', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private handleDBException(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const err = error as QueryFailedError & {
        driverError: { code?: string; detail?: string };
      };

      if (err.driverError?.code === '23505') {
        throw new BadRequestException('Dato duplicado');
      }
    }
    this.logger.error(error);
    throw new BadRequestException('Error en la base de datos');
  }
}

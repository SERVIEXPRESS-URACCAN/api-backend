import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesBusiness } from 'src/module/categories-business/entities/categories-business.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { CreateBusinessDto } from '../dto/create-business.dto';
import { UpdateBusinessDto } from '../dto/update-business.dto';
import { Business } from '../entities/business.entity';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger('OwnerService');
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,

    @InjectRepository(CategoriesBusiness)
    private readonly categoriesRepository: Repository<CategoriesBusiness>,
  ) {}

  findAll() {
    return `This action returns all business`;
  }

  // async getOne(id: number) {
  //   const business = await this.businessRepository.findOne({
  //     where: { id },
  //     relations: ['owner', 'categories'],
  //   });

  //   if (!business) {
  //     throw new NotFoundException(`El negocio con id ${id} no existe`);
  //   }

  //   return business;
  // }

  async create(createBusinessDto: CreateBusinessDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const owner = await queryRunner.manager.findOne(Owner, {
      //   where: { user: { id: userId } },
      // });

      // if (!owner) {
      //   throw new NotFoundException('Owner no encontrado');
      // }

      // const existingBusiness = await queryRunner.manager.findOne(Business, {
      //   where: { owner: { id: owner.id } },
      // });

      // if (existingBusiness) {
      //   throw new BadRequestException('Ya tienes un negocio registrado');
      // }

      const business = queryRunner.manager.create(Business, {
        ...createBusinessDto,
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

  update(id: number, updateBusinessDto: UpdateBusinessDto) {
    return `This action updates a #${id} business`;
  }

  remove(id: number) {
    return `This action removes a #${id} business`;
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

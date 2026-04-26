import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../entities/roles.entity';
import { CreateRolesDto } from '../dto/create-roles.dto';
import { UpdateRolesDto } from '../dto/update-roles.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  async create(createRolesDto: CreateRolesDto): Promise<Roles> {
    const { name } = createRolesDto;

    const existingRole = await this.rolesRepository.findOne({
      where: { name },
      withDeleted: true,
    });

    if (existingRole && existingRole.deletedAt) {
      await this.rolesRepository.restore(existingRole.id);

      Object.assign(existingRole, createRolesDto);
      return this.rolesRepository.save(existingRole);
    }

    if (existingRole) {
      throw new ConflictException(`Role with name '${name}' already exists`);
    }
    const role = this.rolesRepository.create(createRolesDto);
    return this.rolesRepository.save(role);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.rolesRepository.findAndCount({
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: {
        createdAt: 'DESC', // opcional pero recomendado
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

  async findOne(id: number) {
    return this.rolesRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateRolesDto: UpdateRolesDto) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const updated = Object.assign(role, updateRolesDto);
    return this.rolesRepository.save(updated);
  }

  async remove(id: number): Promise<{ message: string }> {
    const role = await this.rolesRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    await this.rolesRepository.softDelete(id);

    return {
      message: `Role with id ${id} deleted successfully`,
    };
  }
}

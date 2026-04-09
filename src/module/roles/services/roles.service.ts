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

  async getAll() {
    return this.rolesRepository.find({});
  }

  async getOne(id: number) {
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

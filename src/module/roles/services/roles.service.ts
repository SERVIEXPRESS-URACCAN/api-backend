import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../entities/roles.entity';
import { CreateRolesDto } from '../dto/create-roles.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  async create(createRolesDto: CreateRolesDto) {
    const { name } = createRolesDto;
    const existing = await this.rolesRepository.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Role already exists');
    }
    const role = this.rolesRepository.create(createRolesDto);
    return this.rolesRepository.save(role);
  }

  async getAll() {
    return this.rolesRepository.find({
      relations: ['user'],
    });
  }

  async getOne(id: number) {
    return this.rolesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }
}

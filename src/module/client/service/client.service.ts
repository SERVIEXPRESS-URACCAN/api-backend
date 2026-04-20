import { Gender } from 'src/module/gender/entities/gender.entity';
import { CreateClientDto } from '../dto/client.dto';
import { User } from 'src/module/users/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '../entities/client.entity';
import { DataSource } from 'typeorm';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateClientDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: dto.user_id },
        relations: ['client'],
      });

      if (!user) throw new NotFoundException('User no encontrado');

      if (user.client) {
        throw new BadRequestException('Este usuario ya tiene un client');
      }

      const gender = await queryRunner.manager.findOne(Gender, {
        where: { id: dto.gender_id },
      });

      if (!gender) {
        throw new NotFoundException('Gender no encontrado');
      }

      const client = queryRunner.manager.create(Client, {
        name: dto.name,
        lastName: dto.lastName,
        cellphone: dto.cellphone,
        gender,
        user,
      });

      const savedClient = await queryRunner.manager.save(client);

      await queryRunner.commitTransaction();

      return savedClient;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findOne(id: number) {
    const client = await this.dataSource.getRepository(Client).findOne({
      where: { id },
      relations: ['user'],
    });

    if (!client) throw new NotFoundException('Client no encontrado');

    return client;
  }
  async findAll() {
    return this.dataSource.getRepository(Client).find({
      relations: ['user'],
    });
  }

  async update(id: number, dto: UpdateClientDto) {
    const repo = this.dataSource.getRepository(Client);

    const client = await this.findOne(id);

    const updated = repo.merge(client, dto);

    return await repo.save(updated);
  }

  async remove(id: number) {
    const repo = this.dataSource.getRepository(Client);

    const client = await this.findOne(id);

    await repo.remove(client);

    return { message: 'Client eliminado correctamente' };
  }
}

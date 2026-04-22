import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { Profile } from 'src/module/profie/entities/profile.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string, withDeleted = false) {
    return this.userRepository.findOne({
      where: { email },
      withDeleted,
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await this.rolesRepository.findOne({
      where: { id: 1 },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email,
        password: hashedPassword,
      });

      const savedUser = await queryRunner.manager.save(user);

      const userRole = queryRunner.manager.create(UserRole, {
        user: savedUser,
        role,
      });

      await queryRunner.manager.save(userRole);

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async restoreUserGraph(userId: number, newPassword: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await queryRunner.manager.restore(User, userId);

      await queryRunner.manager.restore(Profile, {
        user: { id: userId },
      });

      await queryRunner.manager.restore(Owner, {
        user: { id: userId },
      });

      await queryRunner.manager.restore(Mandadero, {
        user: { id: userId },
      });

      const mandaderos = await queryRunner.manager.find(Mandadero, {
        where: { user: { id: userId } },
        withDeleted: true,
        select: ['id'],
      });

      const mandaderoIds = mandaderos.map((m) => m.id);

      if (mandaderoIds.length > 0) {
        await queryRunner.manager.restore(Motorcycle, {
          mandadero: In(mandaderoIds),
        });
      }
      await queryRunner.manager.update(User, userId, {
        password: hashedPassword,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) throw new NotFoundException();

      await queryRunner.manager.softDelete(Profile, {
        user: { id: userId },
      });

      await queryRunner.manager.softDelete(Owner, {
        user: { id: userId },
      });

      const mandaderos = await queryRunner.manager.find(Mandadero, {
        where: { user: { id: userId } },
        select: ['id'],
      });

      const mandaderoIds = mandaderos.map((m) => m.id);

      if (mandaderoIds.length > 0) {
        await queryRunner.manager.softDelete(Motorcycle, {
          mandadero: In(mandaderoIds),
        });
      }

      await queryRunner.manager.softDelete(Mandadero, {
        user: { id: userId },
      });
      await queryRunner.manager.softDelete(User, userId);

      await queryRunner.commitTransaction();

      return { message: 'User deleted correctly' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return { message: 'user actualizado correctamente' };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}

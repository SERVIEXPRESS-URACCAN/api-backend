import {
  BadRequestException,
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
import { Profile } from 'src/module/profile/entities/profile.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import { Business } from 'src/module/business/entities/business.entity';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,

    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string, withDeleted = false) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('user.email = :email', { email });

    if (withDeleted) {
      query.withDeleted();
    }

    return query.getOne();
  }
  async findOneWithRoles(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
  }
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: User[]; pagination: object }> {
    const { page = 1, limit = 10 } = paginationDto;
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [data, total] = await this.userRepository.findAndCount({
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
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'owner',
        'mandadero',
        'profile',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const normalizeEmail = createUserDto.email.toLowerCase().trim();

    const { password, profile } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: {
        email: normalizeEmail,
      },
      withDeleted: true,
    });

    if (existingUser) {
      if (!existingUser.deletedAt) {
        throw new ConflictException({
          message: 'Email already exists',
          canRestore: false,
        });
      }

      throw new ConflictException({
        message: 'This user was deleted',
        canRestore: true,
        userId: existingUser.id,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await this.rolesRepository.findOne({
      where: {
        name: 'client',
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const gender = await this.genderRepository.findOne({
      where: {
        id: profile.gender_id,
      },
    });

    if (!gender) {
      throw new NotFoundException('Gender not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email: normalizeEmail,
        password: hashedPassword,
      });

      const savedUser = await queryRunner.manager.save(user);

      const userRole = queryRunner.manager.create(UserRole, {
        user: savedUser,
        role,
      });

      await queryRunner.manager.save(userRole);

      const newProfile = queryRunner.manager.create(Profile, {
        name: profile.name.trim(),
        lastName: profile.lastName.trim(),
        cellphone: profile.cellphone.trim(),
        gender,
        user: savedUser,
      });

      const savedProfile = await queryRunner.manager.save(newProfile);

      await queryRunner.commitTransaction();

      return {
        id: savedUser.id,
        email: savedUser.email,
        profile: savedProfile,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async restoreUserGraph(userId: number, dto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { profile, password } = dto;

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        withDeleted: true,
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (!existingUser.deletedAt) {
        throw new BadRequestException('User is already active');
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      await queryRunner.manager.restore(User, userId);

      await queryRunner.manager.restore(UserRole, {
        user: { id: userId },
      });

      const existingProfile = await queryRunner.manager.findOne(Profile, {
        where: { user: { id: userId } },
        withDeleted: true,
      });

      const gender = await queryRunner.manager.findOne(Gender, {
        where: { id: profile.gender_id },
      });

      if (!gender) {
        throw new NotFoundException('Gender not found');
      }

      if (existingProfile) {
        await queryRunner.manager.restore(Profile, existingProfile.id);

        await queryRunner.manager.update(Profile, existingProfile.id, {
          name: profile.name,
          lastName: profile.lastName,
          cellphone: profile.cellphone,
          gender,
        });
      }

      await queryRunner.manager.restore(Owner, {
        user: { id: userId },
      });

      const owners = await queryRunner.manager.find(Owner, {
        where: { user: { id: userId } },
        withDeleted: true,
        select: ['id'],
      });

      const ownerIds = owners.map((o) => o.id);

      if (ownerIds.length > 0) {
        await queryRunner.manager.restore(Business, {
          owner: In(ownerIds),
        });
      }

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

      const userWithRelations = await this.dataSource
        .getRepository(User)
        .findOne({
          where: { id: userId },
          relations: ['profile', 'userRoles', 'userRoles.role'],
        });
      return userWithRelations;
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

      const owners = await queryRunner.manager.find(Owner, {
        where: { user: { id: userId } },
        select: ['id'],
      });

      const ownerIds = owners.map((o) => o.id);

      if (ownerIds.length > 0) {
        await queryRunner.manager.softDelete(Business, {
          owner: In(ownerIds),
        });
      }

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
}

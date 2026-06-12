import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Business } from 'src/module/business/entities/business.entity';
import { Gender } from 'src/module/gender/entities/gender.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { Profile } from 'src/module/profile/entities/profile.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,

    private readonly dataSource: DataSource,
  ) {}

  async createUserWithProfile(dto: CreateUserDto & { email: string }) {
    const { password, profile } = dto;

    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });
    if (existingUser) {
      throw new ConflictException({
        field: 'email',
        message: 'Email ya está en uso',
        canRestore: false,
      });
    }

    const existingProfile = await this.profileRepository.findOne({
      where: { cellphone: profile.cellphone.trim() },
      withDeleted: true,
    });
    if (existingProfile) {
      throw new ConflictException({
        field: 'cellphone',
        message: 'El teléfono ya está en uso',
      });
    }

    const [role, gender] = await Promise.all([
      this.rolesRepository.findOne({ where: { name: ILike('client') } }),
      this.genderRepository.findOne({ where: { id: profile.gender_id } }),
    ]);

    if (!role)
      throw new NotFoundException({ field: 'role', message: 'Role not found' });
    if (!gender) throw new NotFoundException('Gender not found');

    const hashedPassword = await bcrypt.hash(password, 10);
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const user = qr.manager.create(User, {
        email: dto.email,
        password: hashedPassword,
      });
      await qr.manager.save(user);

      await Promise.all([
        qr.manager.save(
          qr.manager.create(Profile, {
            name: profile.name.trim(),
            lastName: profile.lastName.trim(),
            cellphone: profile.cellphone.trim(),
            gender,
            user,
          }),
        ),
        qr.manager.save(qr.manager.create(UserRole, { user, role })),
      ]);

      await qr.commitTransaction();

      const result = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['profile', 'userRoles', 'userRoles.role'],
      });

      return result;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();
    return this.createUserWithProfile({ ...dto, email });
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
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateUserDto);
    const updated = await this.userRepository.save(user);

    return updated;
  }
}

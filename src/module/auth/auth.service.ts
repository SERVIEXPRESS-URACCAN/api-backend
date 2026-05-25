import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/service/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Profile } from '../profile/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { DataSource, ILike } from 'typeorm';
import { Gender } from '../gender/entities/gender.entity';
import { UserRole } from '../user-roles/entities/user-roles.entity';
import { Roles } from '../roles/entities/roles.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const { password } = dto;

    const user = await this.usersService.findByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new ForbiddenException('Account not available.');
    }

    const hashedPassword = await bcrypt.compare(password, user.password);

    if (!hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleNames = user.userRoles?.map((ur) => ur.role.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      message: 'Login successful',

      user: {
        id: user.id,
        email: user.email,
        roles: roleNames,
      },

      access_token: token,
    };
  }
  async register(dto: CreateUserDto) {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const { profile, ...userData } = dto;

      const normalizeEmail = dto.email.toLowerCase().trim();

      const existingUser = await qr.manager.findOne(User, {
        where: { email: normalizeEmail },
        withDeleted: true,
      });

      if (existingUser && !existingUser.deletedAt) {
        throw new ConflictException('Email already in use');
      }
      if (existingUser && existingUser.deletedAt) {
        await qr.rollbackTransaction();
        await qr.release();

        const restoredUser = await this.usersService.restoreUserGraph(
          existingUser.id,
          {
            ...dto,
            email: normalizeEmail,
          },
        );

        return {
          message: 'User create successfully',
          data: restoredUser,
        };
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const gender = await qr.manager.findOne(Gender, {
        where: { id: profile.gender_id },
      });

      if (!gender) {
        throw new NotFoundException('Gender not found');
      }

      const clientRole = await qr.manager.findOne(Roles, {
        where: { name: ILike('client') },
      });

      if (!clientRole) {
        throw new NotFoundException('Default role not found');
      }

      const user = qr.manager.create(User, {
        ...userData,
        email: normalizeEmail,
        password: hashedPassword,
      });

      await qr.manager.save(user);

      const newProfile = qr.manager.create(Profile, {
        name: profile.name,
        lastName: profile.lastName,
        cellphone: profile.cellphone,
        gender,
        user,
      });

      await qr.manager.save(newProfile);

      const userRole = qr.manager.create(UserRole, {
        user,
        role: clientRole,
      });

      await qr.manager.save(userRole);
      const userWithProfile = await qr.manager.findOne(User, {
        where: { id: user.id },
        relations: ['profile', 'userRoles', 'userRoles.role'],
      });
      await qr.commitTransaction();

      return userWithProfile;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }
}

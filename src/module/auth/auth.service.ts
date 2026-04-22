import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/service/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new ForbiddenException(
        'Account not available. Please register again.',
      );
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
      token,
    };
  }
  async register(dto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(dto.email, true);

    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException('Email already in use');
    }

    if (existingUser && existingUser.deletedAt) {
      await this.usersService.restoreUserGraph(existingUser.id, dto.password);

      return {
        message: 'User registered successfully',
        userId: existingUser.id,
      };
    }

    const user = await this.usersService.create(dto);

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }
}

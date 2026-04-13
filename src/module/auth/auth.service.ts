import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/service/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    const token = await this.jwtService.signAsync(payload);
    return {
      message: 'Login successful',
      token,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    await this.usersService.create({ email, password });

    return {
      message: 'Registration successful',
    };
  }
}

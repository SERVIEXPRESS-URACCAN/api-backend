import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthTokenService } from './auth-token.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersServiceFind } from '../users/service/users-find.service';
import { UsersService } from '../users/service/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServiceFind: UsersServiceFind,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const { password } = dto;

    const user = await this.usersServiceFind.findByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new ForbiddenException('Account not available.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = this.authTokenService.getUserRoles(user);

    const tokens = await this.authTokenService.issueTokens(user);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        roles,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    const user = await this.usersServiceFind.findOneWithRoles(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userWithToken = await this.usersServiceFind.findByEmail(
      user.email,
      true,
    );

    if (!userWithToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!userWithToken.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      userWithToken.refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.authTokenService.issueTokens(userWithToken);
  }
  async register(dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.usersServiceFind.findOneWithDeleted(email);

    if (existingUser?.deletedAt) {
      const restored = await this.usersService.restoreUserGraph(
        existingUser.id,
        {
          ...dto,
          email,
        },
      );
      return { message: 'User created successfully', data: restored };
    }

    return this.usersService.createUserWithProfile({ ...dto, email });
  }
}

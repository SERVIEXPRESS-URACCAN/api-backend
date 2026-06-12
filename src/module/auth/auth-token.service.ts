import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { StringValue } from 'ms';

type DecodedJwt = JwtPayload & {
  exp: number;
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}
  getUserRoles(user: User): string[] {
    return user.userRoles?.map((ur) => ur.role.name) || [];
  }

  async issueTokens(user: User) {
    const roles = this.getUserRoles(user);

    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      roles,
    );

    await this.saveRefreshToken(user.id, refreshToken);

    return this.buildTokenResponse(accessToken, refreshToken);
  }

  private async generateTokens(user: User, roles: string[]) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.dataSource.getRepository(User).update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private buildTokenResponse(accessToken: string, refreshToken: string) {
    const { exp } = this.jwtService.decode<DecodedJwt>(accessToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: exp,
    };
  }
}

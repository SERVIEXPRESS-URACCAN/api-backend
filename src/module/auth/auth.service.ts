import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/service/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  register() {
    return 'This action adds a new register';
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return {
      message: 'Login successful',
      email: user.email,
    };
  }
}

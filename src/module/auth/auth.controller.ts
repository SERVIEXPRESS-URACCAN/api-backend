import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Auth } from './decorator/auth.decorator';
import { GetUser } from './decorator/getUser.decorator';
import { AuthUser } from './interfaces/auth-user.interface';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Get('order')
  @Auth('client')
  createOrder(@GetUser() user: AuthUser) {
    return {
      message: 'Order created successfully',
      userId: user.id,
    };
  }
}

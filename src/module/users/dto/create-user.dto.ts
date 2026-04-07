import { Type } from 'class-transformer';
import { IsEmail, IsString, IsInt, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsInt()
  role: number;
}

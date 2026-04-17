import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsEmail()
  email: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @MinLength(8)
  password: string;
}

import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(8)
  password: string;
}

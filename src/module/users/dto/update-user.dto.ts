import { IsBoolean, IsEmail, IsInt, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  role?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

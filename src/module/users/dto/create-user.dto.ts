import { Type } from 'class-transformer';
import { IsEmail, IsString, IsInt, IsEnum, IsOptional, IsDate } from 'class-validator';

export enum UserStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  role_id: number;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deletedAt?: Date;

}
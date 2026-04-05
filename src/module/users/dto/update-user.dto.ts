import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsDate
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export class UpdateUserDto {

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsInt()
  role_id?: number;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deletedAt?: Date;
}
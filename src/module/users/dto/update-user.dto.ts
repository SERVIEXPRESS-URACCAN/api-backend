import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsDate,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';


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
  @IsBoolean()
  status?: boolean;

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
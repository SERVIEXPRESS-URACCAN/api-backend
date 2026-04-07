import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
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

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Type(() => Date)
  @IsDate()
  updatedAt: Date;

}
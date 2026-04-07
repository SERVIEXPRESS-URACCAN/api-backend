import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
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


}
import { Type } from 'class-transformer';
import { IsEmail, IsString, IsInt, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator';


export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  role_id: number;

  @IsBoolean()
  status: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;


}
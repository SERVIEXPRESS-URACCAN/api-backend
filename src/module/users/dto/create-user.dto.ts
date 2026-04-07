import { Type } from 'class-transformer';
import { IsEmail, IsString, IsInt, IsOptional, IsDate, IsBoolean } from 'class-validator';


export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  role_id: number;

  @IsBoolean()
  status: boolean;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;


}
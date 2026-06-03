import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('NI')
  @IsString()
  cellphone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  genderId?: number;
}

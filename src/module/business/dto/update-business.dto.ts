import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  city?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsPhoneNumber('NI')
  phone?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];

    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  @Type(() => Number)
  @IsNumber({}, { each: true })
  businessCategories?: number[];
}

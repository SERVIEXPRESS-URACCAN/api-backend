import { Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  price: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;
}

import { Transform, Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
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

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  status?: boolean;

  @IsArray()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return [];

    const arr = Array.isArray(value) ? value : [value];

    return arr.map(Number);
  })
  @IsNumber({}, { each: true })
  categoryIds: number[];
}

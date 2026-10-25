import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsInt()
  city?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }): unknown => {
    const input: unknown = value;

    return typeof input === 'string' ? input.trim() : input;
  })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  businessId?: number;
}

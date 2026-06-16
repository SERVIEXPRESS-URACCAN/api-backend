import { PartialType } from '@nestjs/mapped-types';
import { UpdateProductDto } from './updateProduct.dto';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProductAdminDto extends PartialType(UpdateProductDto) {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  businessId?: number;

  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === '1') return true;
    if (value === 'false' || value === false || value === '0') return false;
    if (value === null || value === undefined || value === '') return undefined;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

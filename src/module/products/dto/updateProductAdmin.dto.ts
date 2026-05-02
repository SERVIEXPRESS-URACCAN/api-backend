import { PartialType } from '@nestjs/mapped-types';
import { UpdateProductDto } from './updateProduct.dto';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductAdminDto extends PartialType(UpdateProductDto) {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  businessId?: number;
}

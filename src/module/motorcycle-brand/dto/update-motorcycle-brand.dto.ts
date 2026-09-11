import { PartialType } from '@nestjs/mapped-types';
import { CreateMotorcycleBrandDto } from './create-motorcycle-brand.dto';

export class UpdateMotorcycleBrandDto extends PartialType(
  CreateMotorcycleBrandDto,
) {}

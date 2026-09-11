import { PartialType } from '@nestjs/mapped-types';
import { CreateMotorcycleModelDto } from './create-motorcycle-model.dto';

export class UpdateMotorcycleModelDto extends PartialType(
  CreateMotorcycleModelDto,
) {}

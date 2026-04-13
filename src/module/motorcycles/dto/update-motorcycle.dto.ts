import { PartialType } from '@nestjs/mapped-types';
import { CreateMotorcycleDto } from './create-motorcycle.dto';

export class UpdateMotorcycleDto extends PartialType(CreateMotorcycleDto) {}

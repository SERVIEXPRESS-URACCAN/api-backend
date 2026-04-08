import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesBusinessDto } from './create-categories-business.dto';

export class UpdateCategoriesBusinessDto extends PartialType(CreateCategoriesBusinessDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesProductDto } from './create-categories-product.dto';

export class UpdateCategoriesProductDto extends PartialType(CreateCategoriesProductDto) {}

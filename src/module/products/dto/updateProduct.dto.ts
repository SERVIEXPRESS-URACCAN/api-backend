import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './products.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

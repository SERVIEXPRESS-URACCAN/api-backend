import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './porducts.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

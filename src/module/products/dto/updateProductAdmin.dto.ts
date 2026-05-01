import { PartialType } from '@nestjs/mapped-types';
import { CreateProductAdmin } from './createProductAdmin.dto';

export class UpdateProductAdminDto extends PartialType(CreateProductAdmin) {}

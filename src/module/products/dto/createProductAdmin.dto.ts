import { IsInt } from 'class-validator';
import { CreateProductDto } from './products.dto';
export class CreateProductAdmin extends CreateProductDto {
  @IsInt()
  businessId: number;
}

import { IsInt } from 'class-validator';
import { CreateProductDto } from './porducts.dto';
export class CreateProductAdmin extends CreateProductDto {
  @IsInt()
  businessId: number;
}

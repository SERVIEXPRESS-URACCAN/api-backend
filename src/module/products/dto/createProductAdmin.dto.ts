import { IsInt } from 'class-validator';
import { CreateProductDto } from './porducts.dto';

export class CreateProductAdminDto extends CreateProductDto {
  @IsInt()
  businessId: number;
}

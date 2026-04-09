import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriesProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

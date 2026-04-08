import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriesBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

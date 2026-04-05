import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateGenderDto {
  @IsNumber()
  @IsNotEmpty()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

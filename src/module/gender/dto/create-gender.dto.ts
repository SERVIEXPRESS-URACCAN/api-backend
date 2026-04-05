import { IsNotEmpty, IsString } from 'class-validator';
export class CreateGenderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

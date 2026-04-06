import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateGenderDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

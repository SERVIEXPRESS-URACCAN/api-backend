import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateMotorcycleBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

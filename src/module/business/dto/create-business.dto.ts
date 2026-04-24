import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  city: number;

  @IsPhoneNumber('NI')
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

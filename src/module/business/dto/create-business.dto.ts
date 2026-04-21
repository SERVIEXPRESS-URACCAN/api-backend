import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  city: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  businessCategories: number[];

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NI')
  @Transform(({ value }: { value: string }) => {
    if (value.startsWith('+505')) return value;
    return `+505${value}`;
  })
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  user: number;
  // days_open: string;
  // opening_time: string;
  // closing_time: string;
  // logo_image: string;
  // banner_image: string;
}

import { Transform } from 'class-transformer';
import {
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

  @IsNumber()
  @IsOptional()
  city?: number;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NI')
  @Transform(({ value }: { value: string }) => {
    if (value.startsWith('+505')) return value;
    return `+505${value}`;
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  city?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsPhoneNumber('NI')
  phone?: string;

  @IsOptional()
  @IsString()
  logoImage?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  businessCategories?: number[];
}

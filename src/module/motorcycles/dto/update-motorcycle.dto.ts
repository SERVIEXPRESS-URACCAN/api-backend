import { IsOptional, IsString } from 'class-validator';

export class UpdateMotorcycleDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  circulationImage?: string;

  @IsOptional()
  @IsString()
  insuranceImage?: string;
}

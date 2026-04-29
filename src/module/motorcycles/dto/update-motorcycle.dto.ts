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
}

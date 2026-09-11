import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMotorcycleDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  model_id?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;
}

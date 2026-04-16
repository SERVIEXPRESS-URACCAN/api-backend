import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMotorcycleDto {
  @IsNotEmpty()
  mandaderoId: number;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsOptional()
  circulationImage?: string;

  @IsString()
  @IsOptional()
  insuranceImage?: string;
}

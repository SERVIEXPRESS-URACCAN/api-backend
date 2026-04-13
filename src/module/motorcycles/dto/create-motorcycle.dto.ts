import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsString()
  circulationImage?: string;

  @IsOptional()
  @IsString()
  insuranceImage?: string;
}

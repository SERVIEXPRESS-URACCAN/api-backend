import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMandaderoSolicitudDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @Type(() => Number)
  @IsInt()
  brandId: number;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}

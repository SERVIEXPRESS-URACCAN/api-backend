import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMandaderoSolicitudDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsInt()
  @IsNotEmpty()
  model_id: number;
}

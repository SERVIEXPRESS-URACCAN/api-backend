import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMandaderoSolicitudDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;
}

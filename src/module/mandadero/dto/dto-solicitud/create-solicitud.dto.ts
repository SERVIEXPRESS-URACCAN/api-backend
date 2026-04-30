import { Allow, IsNotEmpty, IsString } from 'class-validator';

export class CreateMandaderoSolicitudDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @Allow()
  imageIdentification: Express.Multer.File;

  @Allow()
  circulationImage: Express.Multer.File;

  @Allow()
  insuranceImage: Express.Multer.File;
}

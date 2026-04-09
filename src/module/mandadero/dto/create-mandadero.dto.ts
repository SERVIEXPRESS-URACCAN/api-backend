import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMandaderoDto {
  @IsBoolean()
  available: boolean;

  @IsNumber()
  @IsNotEmpty()
  user: number;
}

import { IsInt, IsString } from 'class-validator';

export class CreateMandaderoAdminDto {
  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  cellphone: string;

  @IsString()
  licensePlate: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  color: string;
}

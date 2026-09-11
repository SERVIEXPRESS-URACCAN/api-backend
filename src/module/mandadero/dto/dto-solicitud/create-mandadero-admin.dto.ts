import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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

  @IsInt()
  @IsNotEmpty()
  model_id: number;

  @IsString()
  color: string;
}

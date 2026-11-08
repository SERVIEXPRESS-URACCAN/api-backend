import { Type } from 'class-transformer';
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

  @Type(() => Number)
  @IsInt()
  brandId: number;

  @IsString()
  model: string;

  @IsString()
  color: string;
}

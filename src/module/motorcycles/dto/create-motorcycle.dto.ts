import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMotorcycleDto {
  @Type(() => Number)
  @IsInt()
  mandaderoId: number;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;
}

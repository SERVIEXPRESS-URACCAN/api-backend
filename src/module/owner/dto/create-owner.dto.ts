import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, {
    message: 'El número debe tener 8 dígitos',
  })
  cellphone: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  gender: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  user: number;
}

import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  cellphone: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsNumber()
  @IsNotEmpty()
  gender: number;

  @IsNumber()
  @IsNotEmpty()
  user: number;
}

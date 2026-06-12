import { IsString, IsInt, IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsPhoneNumber('NI')
  @IsNotEmpty()
  cellphone: string;

  @IsInt()
  @IsNotEmpty()
  gender_id: number;
}

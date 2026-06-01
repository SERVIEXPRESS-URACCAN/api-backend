import { IsString, IsInt, IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsPhoneNumber('NI')
  @IsNotEmpty()
  cellphone: string;

  @IsInt()
  gender_id: number;
}
export class CreateProfileAdminDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('NI')
  cellphone: string;

  @IsInt()
  gender_id: number;

  @IsInt()
  user_id: number;
}

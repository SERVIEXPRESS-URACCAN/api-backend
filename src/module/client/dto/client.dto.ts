import { IsString, IsInt } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  cellphone: string;

  @IsInt()
  gender_id: number;

  @IsInt()
  user_id: number;
}

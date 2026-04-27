import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateOwnerDto {
  @IsInt()
  @IsNotEmpty()
  user: number;

  @IsNotEmpty()
  @IsString()
  razonSocial: string;
}

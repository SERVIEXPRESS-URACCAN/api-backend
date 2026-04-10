import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRolesDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

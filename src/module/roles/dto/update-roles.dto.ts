import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRolesDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

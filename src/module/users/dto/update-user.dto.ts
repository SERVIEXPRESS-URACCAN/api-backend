import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsInt()
  role?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

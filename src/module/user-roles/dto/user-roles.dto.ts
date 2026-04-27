import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignRoleDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  roleId: number;
}

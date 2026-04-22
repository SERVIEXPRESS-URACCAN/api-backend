import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;
  @IsNotEmpty()
  @IsInt()
  roleId: number;
}

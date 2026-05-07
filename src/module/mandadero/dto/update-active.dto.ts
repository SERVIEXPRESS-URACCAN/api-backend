import { IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateActiveDto {
  @Type(() => Boolean)
  @IsBoolean()
  isActive: boolean;
}

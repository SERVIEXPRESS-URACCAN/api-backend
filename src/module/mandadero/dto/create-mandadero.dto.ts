import { Type } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';

export class CreateMandaderoDto {
  @IsBoolean()
  @Type(() => Boolean)
  available: boolean;

  @IsNumber()
  @Type(() => Number)
  user: number;
}

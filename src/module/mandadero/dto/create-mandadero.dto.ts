import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateMandaderoDto {
  @IsNumber()
  @Type(() => Number)
  user: number;
}

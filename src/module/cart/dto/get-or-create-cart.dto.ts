import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class GetOrCreateCartDto {
  @IsNotEmpty()
  @Type(() => Number)
  businessId: number;
}

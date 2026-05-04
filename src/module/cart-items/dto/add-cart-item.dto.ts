import { IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

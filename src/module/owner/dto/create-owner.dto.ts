import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateBusinessDto } from 'src/module/business/dto/create-business.dto';

export class CreateOwnerDto {
  @IsInt()
  @IsOptional()
  user?: number;

  @IsNotEmpty()
  @IsString()
  razonSocial: string;

  @Transform(({ value }: { value: string }) => {
    const parsed = JSON.parse(value) as CreateBusinessDto;

    return Object.assign(new CreateBusinessDto(), parsed);
  })
  @ValidateNested()
  @Type(() => CreateBusinessDto)
  business: CreateBusinessDto;
}

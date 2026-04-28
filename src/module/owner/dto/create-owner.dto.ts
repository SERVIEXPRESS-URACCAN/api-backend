import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateBusinessDto } from 'src/module/business/dto/create-business.dto';

export class CreateOwnerDto {
  @IsInt()
  user?: number;

  @IsNotEmpty()
  @IsString()
  razonSocial: string;

  @Transform(
    ({ value }: { value: string }) => JSON.parse(value) as CreateBusinessDto,
  )
  @ValidateNested()
  @Type(() => CreateBusinessDto)
  business: CreateBusinessDto;
}

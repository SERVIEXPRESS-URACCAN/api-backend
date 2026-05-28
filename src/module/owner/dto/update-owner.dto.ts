import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { UpdateProfileDto } from 'src/module/profile/dto/update-profile.dto';

export class UpdateOwnerDto {
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}

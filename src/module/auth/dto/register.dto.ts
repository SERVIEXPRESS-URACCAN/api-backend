import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
  Matches,
} from 'class-validator';
import { CreateProfileDto } from 'src/module/profile/dto/profile.dto';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'Only Gmail addresses are allowed',
  })
  email: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @MinLength(8)
  password: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

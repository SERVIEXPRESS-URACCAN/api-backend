import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CreateProfileDto } from 'src/module/profile/dto/profile.dto';

export class CreateUserDto {
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'Only Gmail addresses are allowed',
  })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

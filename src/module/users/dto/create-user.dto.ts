import { Transform, Type } from 'class-transformer';
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
    message: 'Solo se permiten direcciones de Gmail.',
  })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Transform(({ value }: { value: string }) => value.trim())
  password: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

import { Transform, Type } from 'class-transformer';
import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { CreateProfileDto } from 'src/module/profie/dto/profile.dto';

export class RegisterDto {
  @IsString()
  @IsEmail()
  email: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @MinLength(8)
  password: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;
}

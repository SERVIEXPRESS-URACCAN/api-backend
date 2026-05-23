import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class FindProfilesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  role?: string;
}

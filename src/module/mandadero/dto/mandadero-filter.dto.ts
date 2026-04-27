import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { Transform, Type } from 'class-transformer';

export class FilterMandaderoDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  available?: boolean;
}

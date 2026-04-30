import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IsOptional, IsEnum, IsInt, Min, IsBoolean } from 'class-validator';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { Transform, Type } from 'class-transformer';

export class FilterMandaderoDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  available?: boolean;
}

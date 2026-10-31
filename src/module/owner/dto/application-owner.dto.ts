import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';

export class OwnerApplicationsPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;
}

import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DeliveryStatus } from '../enum/orderStatus';

export class GetMandaderoOrdersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;
}

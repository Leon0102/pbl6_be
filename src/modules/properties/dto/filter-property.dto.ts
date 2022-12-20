import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Order } from '../../../common/constants/order-type.enum';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class FilterPropertyDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  createdAt: Order;
}

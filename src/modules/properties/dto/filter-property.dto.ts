import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Order } from '../../../common/constants/order-type.enum';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class FilterPropertyDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  createdAt: Order;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isVerified?: string;
}

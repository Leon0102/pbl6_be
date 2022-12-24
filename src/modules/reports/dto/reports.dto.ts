import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportsDto {
  @ApiProperty({
    example: '2022-01-01.2022-01-31',
    description: 'date range in format YYYY-MM-DD.YYYY-MM-DD'
  })
  @IsString()
  @IsNotEmpty()
  dateRange: string;

  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    description: 'uuid of property'
  })
  @IsUUID()
  @IsOptional()
  propertyId: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class SearchPropertyDto extends PageOptionsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly location: string;

  @IsDate()
  @ApiPropertyOptional()
  readonly checkIn: Date;

  @IsDate()
  @ApiPropertyOptional()
  readonly checkOut: Date;

  @IsNumber()
  @ApiPropertyOptional()
  readonly rooms: number;

  @IsNumber()
  @ApiPropertyOptional()
  readonly guests: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly category: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly orderBy: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  readonly startPrice: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  readonly endPrice: number;
}

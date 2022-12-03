import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { OrderBy } from '../../../constants';

export class SearchPropertyDto extends PageOptionsDto {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly location: string;

    @IsDate()
    @IsOptional()
    @ApiPropertyOptional()
    readonly checkIn: Date;

    @IsDate()
    @IsOptional()
    @ApiPropertyOptional()
    readonly checkOut: Date;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional()
    readonly rooms: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional()
    readonly guests: number;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly category: string;

    @IsEnum(OrderBy)
    @IsOptional()
    @ApiPropertyOptional()
    readonly orderByPrice: OrderBy;

    @IsEnum(OrderBy)
    @IsOptional()
    @ApiPropertyOptional()
    readonly orderByRating: OrderBy;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional()
    readonly startPrice: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional()
    readonly endPrice: number;
}

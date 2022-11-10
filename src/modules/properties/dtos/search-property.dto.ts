import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class SearchPropertyDto extends PageOptionsDto {
    @IsString()
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
}

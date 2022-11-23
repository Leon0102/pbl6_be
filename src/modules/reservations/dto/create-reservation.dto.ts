import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    roomTypeId: string;

    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    checkIn: Date;


    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    checkOut: Date;

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    roomIds: string[];


    @ApiPropertyOptional()
    specialRequest?: string;
}

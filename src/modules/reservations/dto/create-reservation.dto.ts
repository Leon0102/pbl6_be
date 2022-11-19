import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

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


    @ApiPropertyOptional()
    specialRequest?: string;
}

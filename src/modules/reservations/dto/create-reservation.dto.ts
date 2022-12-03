import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @IsNumber()
  @IsNotEmpty()
  roomNumber: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  guestCount: number;

  @ApiPropertyOptional()
  specialRequest?: string;
}

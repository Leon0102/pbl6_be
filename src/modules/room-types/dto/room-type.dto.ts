import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Facility, RoomSize } from '../interfaces';

export class RoomTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bedType: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsObject()
  size: RoomSize;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  facilities: Facility;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxGuests: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(10)
  roomCount: number;
}

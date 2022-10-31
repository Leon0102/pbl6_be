import {
  IsString,
  IsObject,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Facility, RoomSize } from '../interfaces';

export class RoomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsObject()
  size: RoomSize;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  @IsOptional()
  facilities: Facility;

  @IsNumber()
  @Min(0)
  maxGuests: number;

  @IsNumber()
  @Min(0)
  roomCount: number;
}

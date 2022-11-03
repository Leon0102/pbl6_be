import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';

import { Facility } from '../interfaces';

export class PropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  wardCode: string;

  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsObject()
  @IsOptional()
  facilities: Facility;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  roomCount: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

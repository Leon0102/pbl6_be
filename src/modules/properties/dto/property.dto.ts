import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min
} from 'class-validator';

import { Facility } from '../interfaces';

export class PropertyDto {
  @ApiProperty({
    example: 'Da Nang Hotel',
  })
  @IsString()
  @IsNotEmpty()
  name: string;


  @ApiProperty({
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
  })
  @IsString()
  wardCode: string;

  @ApiProperty({
  })
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @ApiProperty({
  })
  @IsObject()
  @IsOptional()
  facilities: Facility;

  @ApiProperty({
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  roomCount: number;

  @ApiProperty({
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

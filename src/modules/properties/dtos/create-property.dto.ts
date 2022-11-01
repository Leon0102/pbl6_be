import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsObject,
  IsArray,
} from 'class-validator';

import { Facility, Location } from '../interfaces';
import { PropertyDto } from './property.dto';
import { CreateRoomTypeDto } from '@modules/room-types/dtos/create-room-type.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
export class CreatePropertyDto extends PropertyDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomTypeDto)
  roomTypes: CreateRoomTypeDto[];

  @IsArray()
  @IsNotEmpty()
  images: string[];
}

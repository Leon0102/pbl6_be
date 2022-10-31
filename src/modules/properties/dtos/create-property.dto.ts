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
import { RoomTypeDto } from '@modules/room-types/dtos/room-type.dto';
export class CreatePropertyDto extends PropertyDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoomTypeDto)
  roomTypes: RoomTypeDto[];
}

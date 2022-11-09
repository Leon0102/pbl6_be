import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsNotEmpty
} from 'class-validator';
import { RoomTypeDto } from './room-type.dto';

export class CreateRoomTypeDto extends RoomTypeDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  images: string[];
}

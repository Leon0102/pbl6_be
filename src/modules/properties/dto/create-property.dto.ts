import { IsArray, IsNotEmpty } from 'class-validator';

import { CreateRoomTypeDto } from '@modules/room-types/dto/create-room-type.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PropertyDto } from './property.dto';
export class CreatePropertyDto extends PropertyDto {
  @ApiProperty({ example: 'Hotel', description: 'Property type' })
  @IsArray()
  @IsNotEmpty()
  @Type(() => CreateRoomTypeDto)
  roomTypes: CreateRoomTypeDto[];

  @ApiProperty({
    example: '1.jpg', description: 'Property main image',
  })
  @IsArray()
  @IsNotEmpty()
  images: string[];
}

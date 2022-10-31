import { IsString, IsNotEmpty, IsNumber, Min, IsObject } from 'class-validator';
import { RoomSize, Facility } from '../interfaces';
import { RoomTypeDto } from './room-type.dto';

export class CreateRoomTypeDto extends RoomTypeDto {}

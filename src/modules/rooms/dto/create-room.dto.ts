import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  roomTypeId: string;
}

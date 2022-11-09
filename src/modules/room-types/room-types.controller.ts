import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiAcceptedResponse, ApiTags } from '@nestjs/swagger';
import { CreateRoomTypeDto } from './dtos/create-room-type.dto';
import { UpdateRoomTypeDto } from './dtos/update-room-type.dto';
import { RoomTypesService } from './room-types.service';

@Controller('room-types')
@ApiTags('room-types')
export class RoomTypesController {

  constructor(
    private readonly roomTypesService: RoomTypesService,
  ) {}

  @Get(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Find room types by details',
  })
  @HttpCode(HttpStatus.OK)
  async getRoomTypes(
    @Param('id') id: number,
  ) {
    return await this.roomTypesService.getRoomType(id);
  }

  @Post()
  @ApiAcceptedResponse({
    type: String,
    description: 'Create room type',
  })
  @HttpCode(HttpStatus.CREATED)
  async createRoomType(
    @Query('propertyId') propertyId: number,
    @Body() roomType: CreateRoomTypeDto,
  ) {
    return await this.roomTypesService.create(propertyId, roomType);
  }


  @Patch(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Update room type',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  async updateRoomType(
    @Param('id') id: number,
    @Query('propertyId') propertyId: number,
    @Body() roomType: UpdateRoomTypeDto,
  ) {
    return await this.roomTypesService.update(id, propertyId, roomType);
  }

  @Delete(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Delete room type',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteRoomType(
    @Param('id') id: number,
    @Query('propertyId') propertyId: number,
  ) {
    return await this.roomTypesService.remove(id, propertyId);
  }

}

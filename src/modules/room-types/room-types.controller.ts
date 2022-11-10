import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from '../../guards/roles.guard';
import { GetUser } from '../auth/decorators';
import { CreateRoomTypeDto } from './dtos/create-room-type.dto';
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
  @UseGuards(RoleGuard([RoleType.HOST, RoleType.GUEST]))
  @HttpCode(HttpStatus.OK)
  async getRoomTypes(
    @GetUser() user: User,
    @Param('id') id: number,
  ) {
    return await this.roomTypesService.getRoomType(id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Post()
  @ApiOkResponse({
    type: String,
    description: 'Create room type',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files'))
  async createRoomType(
    @GetUser() user: User,
    @Query('propertyId') propertyId: number,
    @Body() roomType: CreateRoomTypeDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.roomTypesService.createRoomType(user.id, propertyId, roomType, files);
  }


  @Patch(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Update room type',
  })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(RoleGuard([RoleType.HOST]))
  @HttpCode(HttpStatus.ACCEPTED)
  async updateRoomType(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() roomType: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log(roomType);
    return await this.roomTypesService.update(user.id, id, roomType, files);
  }

  @Delete(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Delete room type',
  })
  @UseGuards(RoleGuard([RoleType.HOST]))
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteRoomType(
    @GetUser() user: User,
    @Param('id') id: number,
  ) {
    return await this.roomTypesService.remove(user.id, id);
  }

}

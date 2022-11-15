import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from '../../guards/roles.guard';
import { GetUser } from '../auth/decorators';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { RoomTypesService } from './room-types.service';

@Controller('room-types')
@ApiTags('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Find room type details'
  })
  @UseGuards(RoleGuard([RoleType.HOST, RoleType.GUEST]))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find room type details' })
  async getRoomTypes(@GetUser() user: User, @Param('id') id: string) {
    console.log(id);
    return await this.roomTypesService.getRoomType(user.id, id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Post()
  @ApiOkResponse({
    type: String,
    description: 'Create room type'
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Create room type' })
  async createRoomType(
    @GetUser() user: User,
    @Query('propertyId') propertyId: string,
    @Body() roomType: CreateRoomTypeDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.roomTypesService.createRoomType(
      user.id,
      propertyId,
      roomType,
      files
    );
  }

  @Patch(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Update room type'
  })
  @ApiOperation({ summary: 'Update room type' })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(RoleGuard([RoleType.HOST]))
  @HttpCode(HttpStatus.ACCEPTED)
  async updateRoomType(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() roomType: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.roomTypesService.update(user.id, id, roomType, files);
  }

  @Delete(':id')
  @ApiAcceptedResponse({
    type: String,
    description: 'Delete room type'
  })
  @ApiOperation({ summary: 'Delete room type' })
  @UseGuards(RoleGuard([RoleType.HOST]))
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteRoomType(@GetUser() user: User, @Param('id') id: string) {
    return await this.roomTypesService.remove(user.id, id);
  }
}

import { GetUser } from '@modules/auth/decorators';
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
import { ParseIntPipe } from '@nestjs/common/pipes';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiAcceptedResponse, ApiTags } from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { SearchPropertyDto } from './dtos/search-property.dto';
import { UpdatePropertyDto } from './dtos/update-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
@ApiTags('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.HOST, RoleType.GUEST]))
  @ApiAcceptedResponse({
    type: String,
    description: 'Find all properties by page',
  })
  async findByPage(
    @GetUser() user: User,
    @Query('page', ParseIntPipe) page: number) {
    return this.propertiesService.findByPage(page);
  }

  @Get('filters')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.HOST, RoleType.GUEST]))
  @ApiAcceptedResponse({
    type: String,
    description: 'Search properties by page',
  })
  async search(
    @Query() query: SearchPropertyDto,
  ) {
    return this.propertiesService.search(query);
  }

  // Get Details of a property
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(

    @Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.findOne(id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @GetUser() user: User,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.create(user.id, createPropertyDto, files);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async remove(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.remove(user.id, id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.update(user.id, id, updatePropertyDto, files);
  }
}

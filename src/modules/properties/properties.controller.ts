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
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { ArrayFilesLimits } from '../../decorators';
import { CreatePropertyDto, SearchPropertyDto, UpdatePropertyDto } from './dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
@ApiTags('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('my-properties')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.HOST]))
  @ApiOkResponse({
    type: String,
    description: 'Find all properties by host'
  })
  @ApiOperation({ summary: 'Find all properties by host' })
  async getMyProperties(@GetUser() user: User) {
    return this.propertiesService.getMyProperties(user.id);
  }

  @Get('filters')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search properties' })
  @ApiAcceptedResponse({
    type: String,
    description: 'Search properties by page'
  })
  async search(@Query() query: SearchPropertyDto) {
    return this.propertiesService.search(query);
  }

  // Get Details of a property
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find One Properties' })
  async findById(

    @Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a property' })
  @ArrayFilesLimits(30)
  async create(
    @GetUser() user: User,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.propertiesService.create(user.id, createPropertyDto, files);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @HttpCode(HttpStatus.ACCEPTED)
  async remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(user.id, id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.propertiesService.update(user.id, id, updatePropertyDto, files);
  }
}

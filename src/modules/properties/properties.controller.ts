import { GetUser } from '@modules/auth/decorators';
import { ReviewsService } from '@modules/reviews/reviews.service';
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
  UseInterceptors,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { ArrayFilesLimits } from '../../decorators';
import { CreatePropertyDto, SearchPropertyDto, UpdatePropertyDto } from './dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
@ApiTags('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly reviewsService: ReviewsService
  ) {}

  @Get(':id/reviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get All Reviews Of Property' })
  async getReviewsOfProperty(@Param('id') id: string) {
    return this.reviewsService.getReviewsByPropertyId(id);
  }

  @Get('filters')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search properties' })
  @ApiAcceptedResponse({
    type: String,
    description: 'Search properties by page',
  })
  async search(@Query() query: SearchPropertyDto) {
    return this.propertiesService.search(query);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiOperation({ summary: 'Find all properties' })
  @ApiAcceptedResponse({
    type: String,
    description: 'Find all properties',
  })
  async findAll(@Query() query: FilterPropertyDto) {
    return this.propertiesService.findAll(query);
  }
  @Patch(':id/verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiOperation({ summary: 'Verify a property' })
  async verifyProperty(@Param('id') id: string) {
    return this.propertiesService.verifyProperty(id);
  }

  @Get(':propertyId/roomtypes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.HOST]))
  @ApiOperation({ summary: 'Get Room Types Of properties' })
  @ApiOkResponse({
    type: String,
    description: 'Get Room Types Of properties',
  })
  async getRoomTypesOfProperty(
    @GetUser() user: User,
    @Param('propertyId') propertyId: string
  ) {
    return this.propertiesService.getRoomTypesOfProperty(user.id, propertyId);
  }

  // Get Details of a property
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find One Properties' })
  async findById(@Param('id') id: string) {
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

  @UseGuards(RoleGuard([RoleType.HOST, RoleType.ADMIN]))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @HttpCode(HttpStatus.ACCEPTED)
  async remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(user, id);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @HttpCode(HttpStatus.ACCEPTED)
  @ArrayFilesLimits(10)
  async update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.propertiesService.update(user.id, id, updatePropertyDto, files);
  }

  @UseGuards(RoleGuard([RoleType.HOST]))
  @Post('test')
  @ApiOperation({ summary: 'Test upload' })
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FilesInterceptor('files'))
  async test(
    @GetUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: any
  ) {
    return this.propertiesService.test(user.id, files, data);
  }
}

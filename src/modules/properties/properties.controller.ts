import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpException,
  Get,
  HttpStatus,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { RoleType } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { brotliDecompressSync } from 'zlib';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { UpdatePropertyDto } from './dtos/update-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @HttpCode(200)
  async findByPage(@Query('page', ParseIntPipe) page: number) {
    try {
      if (page < 1) {
        throw new Error('Page number must be greater than 0');
      }
      const properties = await this.propertiesService.findByPage(page);
      return {
        success: true,
        statusCode: 200,
        message: 'Property fetched successfully',
        data: {
          properties,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Get Details of a property
  @Get(':id')
  @HttpCode(200)
  async findById(@Param('id', ParseIntPipe) id: number) {
    try {
      const property = await this.propertiesService.findOne(id);
      return {
        success: true,
        statusCode: 200,
        message: 'Property fetched successfully',
        data: {
          property,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(RoleGuard(RoleType.HOST))
  @Post()
  @HttpCode(201)
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    try {
      const isCreated: boolean = await this.propertiesService.create(
        2,
        createPropertyDto,
      );
      if (isCreated) {
        return {};
      }
      throw new Error('Property could not be created');
    } catch (error) {
      // console.error(error);
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.propertiesService.remove(id);
      return;
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    try {
      await this.propertiesService.update(id, updatePropertyDto);
      return;
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

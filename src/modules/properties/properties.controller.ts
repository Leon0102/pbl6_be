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
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { brotliDecompressSync } from 'zlib';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @HttpCode(200)
  async findAll() {
    try {
      return {
        success: true,
        statusCode: 200,
        message: 'Properties fetched successfully',
        data: {},
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
  @Post()
  @HttpCode(201)
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    try {
      const isCreated: boolean = await this.propertiesService.create(
        2,
        createPropertyDto,
      );
      if (isCreated) {
        return {
          success: true,
          statusCode: 201,
          message: 'Property created successfully',
          data: {},
        };
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
      return {
        success: true,
        statusCode: 200,
        message: 'Property deleted successfully',
        data: {},
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
}

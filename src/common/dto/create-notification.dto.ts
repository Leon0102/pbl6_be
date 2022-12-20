import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsObject
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({})
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({})
  @IsOptional()
  @IsObject()
  context?: any;
}

export class AdminNotificationDto {
  @ApiProperty({})
  @IsString()
  title: string;
  @ApiProperty({})
  @IsString()
  body: string;
}

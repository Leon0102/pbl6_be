import { IsArray, IsNotEmpty } from 'class-validator';
import { PropertyDto } from './property.dto';

export class UpdatePropertyDto extends PropertyDto {
  @IsArray()
  @IsNotEmpty()
  images: string[];
}

export class UpdatePropertyVerificationDto {
  @IsNotEmpty()
  verified: boolean;
}

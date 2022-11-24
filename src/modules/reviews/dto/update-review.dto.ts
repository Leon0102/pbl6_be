import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from '.';

export class UpdateReviewDto extends PartialType(OmitType(CreateReviewDto, ['propertyId', 'reservationId'] as const)) {}

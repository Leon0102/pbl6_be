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
  UseGuards
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { Review, RoleType } from '@prisma/client';
import RoleGuard from '../../guards/roles.guard';
import { CreateReviewDto } from './dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@ApiTags('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reservation/:reservationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOkResponse({
    description: 'Get Review of Reservation'
  })
  @ApiOperation({ summary: 'Get Review of Reservation' })
  async getReviewsByReservationId(
    @Param('reservationId') reservationId: string
  ): Promise<Review[]> {
    return this.reviewsService.getReviewsByReservationId(reservationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOkResponse({
    description: 'Create Review',
    type: String
  })
  @ApiOperation({ summary: 'Create Review' })
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(createReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiAcceptedResponse({
    description: 'Delete Review',
    type: String
  })
  @ApiOperation({ summary: 'Delete Review' })
  async deleteReview(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiAcceptedResponse({
    description: 'Update Review',
    type: String
  })
  @ApiOperation({ summary: 'Update Review' })
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.updateReview(id, updateReviewDto);
  }
}

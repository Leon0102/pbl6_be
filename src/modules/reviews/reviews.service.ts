import { Injectable } from '@nestjs/common';
import { db } from '../../common/utils/dbClient';
import { CreateReviewDto } from './dto';
import { UpdateReviewDto } from './dto/update-review.dto';



@Injectable()
export class ReviewsService {
  private readonly review = db.review;


  createReview(dto: CreateReviewDto) {
    return this.review.create({
      data: {
        content: dto.content,
        rating: dto.rating,
        reservation: {
          connect: {
            id: dto.reservationId
          }
        },
        property: {
          connect: {
            id: dto.propertyId
          }
        },
      }
    });
  }

  getReviewsByPropertyId(propertyId: string) {
    return this.review.findMany({
      where: {
        propertyId
      }
    });
  }

  getReviewsByReservationId(reservationId: string) {
    return this.review.findMany({
      where: {
        reservationId
      }
    });
  }

  getReviewById(id: string) {
    return this.review.findUnique({
      where: {
        id
      }
    });
  }

  updateReview(id: string, dto: UpdateReviewDto) {
    return this.review.update({
      where: {
        id
      },
      data: {
        content: dto.content,
        rating: dto.rating,
      }
    });
  }

  deleteReview(id: string) {
    return this.review.delete({
      where: {
        id
      }
    });
  }

}

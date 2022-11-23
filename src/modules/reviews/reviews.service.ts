import { BadRequestException, Injectable } from '@nestjs/common';
import { db } from '../../common/utils/dbClient';
import { CreateReviewDto } from './dto';
import { UpdateReviewDto } from './dto/update-review.dto';



@Injectable()
export class ReviewsService {
  private readonly review = db.review;


  async createReview(dto: CreateReviewDto) {
    // find property contains reservation
    const property = await db.property.findUnique({
      where: {
        id: dto.propertyId
      },
      include: {
        roomTypes: {
          include: {
            rooms: {
              include: {
                roomReserved: true
              }
            }
          }
        }
      }
    });
    // check if reservation is exist
    const reservation = property.roomTypes.map(roomType => roomType.rooms)
      .flat().map(room => room.roomReserved).flat().find(roomReserved => roomReserved.reservationId === dto.reservationId);
    if (!reservation) {
      throw new BadRequestException('Reservation is not exist');
    }
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
    }).then(res => {
      return res;
    })
      .catch(err => {
        throw new BadRequestException('Review already exist');
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

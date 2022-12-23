import { getReservationPrice } from '@common/utils/utils';
import { ReservationsService } from '@modules/reservations/reservations.service';
import { Injectable } from '@nestjs/common';
import { db } from '../../common/utils/dbClient';
@Injectable()
export class ReportsService {
  private readonly reservation = db.reservation;
  constructor(private readonly reservationsService: ReservationsService) {}

  async getHostReservationsReport(
    query: {
      propertyId: string;
      dateRange: string;
    },
    userId: string
  ) {
    // get reservation of all room of host
    const rs = await this.reservation.findMany({
      where: {
        roomReserved: {
          every: {
            room: {
              roomType: {
                property: {
                  userId
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        guestCount: true,
        specialRequest: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        roomReserved: {
          select: {
            room: {
              select: {
                roomType: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    property: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    const finalRs = rs.map(r => {
      const { property, ...roomType } = r.roomReserved[0].room.roomType;
      const {
        id,
        checkIn,
        checkOut,
        guestCount,
        status,
        specialRequest,
        createdAt,
        user,
        roomReserved
      } = r;
      const roomsNumber = roomReserved.length;
      return {
        id,
        checkIn,
        checkOut,
        duration: Math.floor(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
        ),
        status,
        roomsNumber,
        guestCount,
        specialRequest,
        totalPrice: getReservationPrice(
          checkOut,
          checkIn,
          roomType.price,
          roomsNumber
        ),
        createdAt,
        user,
        property,
        roomType
      };
    });
    return finalRs
      .filter(rs => {
        if (query.propertyId) {
          return rs.property.id === query.propertyId;
        }
        return true;
      })
      .filter(rs => {
        if (query.dateRange) {
          const [start, end] = query.dateRange.split('.');
          const startDate = new Date(start);
          const endDate = new Date(end);
          console.log(start, end);
          return (
            rs.createdAt.getTime() >= startDate.getTime() &&
            rs.createdAt.getTime() <= endDate.getTime()
          );
        }
        return true;
      });
  }
}

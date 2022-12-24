import {
  getDaysDuration,
  getReservationPrice,
  getRevenue
} from '@common/utils/utils';
import { ReservationsService } from '@modules/reservations/reservations.service';
import { Injectable } from '@nestjs/common';
import { db } from '../../common/utils/dbClient';
import { ReportsDto } from './dto/reports.dto';
@Injectable()
export class ReportsService {
  private readonly reservation = db.reservation;
  constructor(private readonly reservationsService: ReservationsService) {}

  async getHostReservationsReport(query: ReportsDto, userId: string) {
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
      },
      orderBy: {
        createdAt: 'desc'
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
        duration: getDaysDuration(checkIn, checkOut),
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
    const [start, end] = query.dateRange.split('.');
    const startDate = new Date(start);
    const endDate = new Date(end);
    const filteredRs = finalRs
      .filter(rs => {
        if (query.propertyId) {
          return rs.property.id === query.propertyId;
        }
        return true;
      })
      .filter(rs => {
        return (
          rs.createdAt.getTime() >= startDate.getTime() &&
          rs.createdAt.getTime() <= endDate.getTime()
        );
      });
    const totalPrice = filteredRs.reduce((acc, cur) => {
      if (cur.status === 'CONFIRMED') return acc + cur.totalPrice;
      return acc;
    }, 0);
    const revenue = getRevenue(
      filteredRs,
      getDaysDuration(startDate, endDate) > 32
    );
    const statusCount = {
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      FAILED: 0,
      COMPLETED: 0
    };
    filteredRs.forEach(element => {
      statusCount[element.status] += 1;
    });
    return {
      totalPrice,
      revenue,
      statusCount,
      reservations: filteredRs
    };
  }
}

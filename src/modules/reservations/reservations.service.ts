import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationStatus, RoleType, User } from '@prisma/client';
import { db } from '../../common/utils/dbClient';
import { StatusReservation } from '../../constants';
import { RoomsService } from '../rooms/rooms.service';
import { CreateReservationDto } from './dto';

@Injectable()
export class ReservationsService {
  private readonly reservation = db.reservation;
  constructor(private readonly roomsService: RoomsService) {}

  async createReservation(userId: string, dto: CreateReservationDto) {
    const rooms = await this.roomsService.getListRoomsByListIds(dto.roomIds);

    const reservation = await this.reservation.create({
      data: {
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        specialRequest: dto.specialRequest,
        status: ReservationStatus.PENDING,
        roomReserved: {
          create: rooms.map(room => ({
            roomId: room.id
          }))
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    });
    return {
      message: 'Create reservation success'
    };
  }

  async findAll() {
    return await this.reservation.findMany({
      include: {
        roomReserved: true,
        user: true
      }
    });
  }

  async getReservationOfHost(userId: string) {
    // check if user is host
    const user = await db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        role: true
      }
    });

    if (user.role.name !== RoleType.HOST) {
      throw new NotFoundException('User is not host');
    }
    // get reservation of all room of host
    const rooms = await db.property.findMany({
      where: {
        userId
      },
      select: {
        roomTypes: {
          select: {
            rooms: {
              select: {
                id: true,
                roomReserved: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  async getOneReservation(user: User, id: string) {
    const rs = await this.reservation.findUnique({
      where: {
        id
      },
      include: {
        roomReserved: {
          select: {
            room: {
              select: {
                roomType: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    photos: true,
                    bedType: true,
                    size: true,
                    property: {
                      select: {
                        id: true,
                        name: true,
                        categoryId: true
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

    if (!rs) {
      throw new NotFoundException('Not found reservation');
    }

    if (rs.userId !== user.id) {
      throw new NotFoundException('Not found reservation');
    }

    const totalPrice = rs.roomReserved.reduce((acc, cur) => {
      return acc + cur.room.roomType.price;
    }, 0);

    const numberOfRooms = rs.roomReserved.reduce((acc, cur) => {
      return acc + 1;
    }, 0);
    return {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      id: rs.id,
      checkIn: rs.checkIn,
      checkOut: rs.checkOut,
      status: rs.status,
      specialRequest: rs.specialRequest,
      property: rs.roomReserved[0].room.roomType.property,
      roomType: rs.roomReserved[0].room.roomType,
      totalPrice,
      numberOfRooms
    };
  }
  async getUserReservation(userId: string) {
    const rs = await this.reservation.findMany({
      where: {
        userId
      },
      include: {
        roomReserved: {
          select: {
            room: {
              select: {
                roomType: {
                  select: {
                    name: true,
                    price: true,
                    property: {
                      select: {
                        id: true,
                        name: true,
                        categoryId: true
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
    // count total price  of reservation
    const result = rs.map(reservation => {
      const totalPrice = reservation.roomReserved.reduce((acc, cur) => {
        return acc + cur.room.roomType.price;
      }, 0);
      return {
        id: reservation.id,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        status: reservation.status,
        createdAt: reservation.createdAt,
        specialRequest: reservation.specialRequest,
        property: reservation.roomReserved[0].room.roomType.property,
        roomType: reservation.roomReserved[0].room.roomType.name,
        totalPrice
      };
    });
    return result;
  }

  async cancelReservation(userId?: string, id?: string) {
    const reservation = await this.reservation.findUnique({
      where: {
        id
      },
      select: {
        status: true,
        userId: true
      }
    });

    if (!reservation) {
      throw new NotFoundException('Not found reservation');
    }

    if (reservation.userId !== userId) {
      throw new NotFoundException('Not found reservation');
    }

    if (reservation.status !== StatusReservation.PENDING) {
      throw new NotFoundException('Reservation is not pending');
    }

    await this.reservation.update({
      where: {
        id
      },
      data: {
        status: ReservationStatus.CANCELLED
      }
    });

    return {
      message: 'Cancel reservation success'
    };
  }

  async confirmReservation(id: string) {
    const reservation = await this.reservation.findUnique({
      where: {
        id
      },
      select: {
        status: true,
        roomReserved: {
          select: {
            roomId: true
          }
        }
      }
    });

    if (!reservation) {
      throw new NotFoundException('Not found reservation');
    }

    if (reservation.status !== StatusReservation.PENDING) {
      throw new NotFoundException('Reservation is not pending');
    }

    await this.reservation.update({
      where: {
        id
      },
      data: {
        status: ReservationStatus.CONFIRMED
      }
    });

    reservation.roomReserved.forEach(async room => {
      await this.roomsService.updateStatusRoom(room.roomId, 'UNAVAILABLE');
    });

    return {
      message: 'Confirm reservation success'
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async checkReservation() {
    const reservations = await this.reservation.findMany({
      where: {
        status: StatusReservation.PENDING,
        checkIn: {
          lte: new Date()
        }
      },
      select: {
        id: true
      }
    });

    reservations.forEach(async reservation => {
      await this.cancelReservation(reservation.id);
    });
  }
}

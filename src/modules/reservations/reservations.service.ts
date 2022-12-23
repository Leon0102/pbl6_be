import { getReservationPrice } from '@common/utils/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationStatus, RoleType, User } from '@prisma/client';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { db } from '../../common/utils/dbClient';
import { StatusReservation } from '../../constants';
import { MailService } from '../../shared/mail.service';
import { NotificationsService } from '../../shared/notification.service';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { CreateReservationDto } from './dto';

@Injectable()
export class ReservationsService {
  private readonly reservation = db.reservation;
  constructor(
    private readonly roomsService: RoomsService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,

    private readonly userService: UsersService
  ) {}

  async createReservation(userId: string, dto: CreateReservationDto) {
    const user = await this.userService.getUserById(userId);

    const rooms = await this.roomsService.getListRoomsAvailableByRoomType(
      dto.roomTypeId,
      dto.roomNumber,
      dto.checkIn,
      dto.checkOut
    );

    const reservation = await this.reservation.create({
      data: {
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        specialRequest: dto.specialRequest,
        status: ReservationStatus.PENDING,
        guestCount: dto.guestCount,
        roomReserved: {
          create: rooms.slice(0, dto.roomNumber).map(room => ({
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
    const totalPrice =
      rooms[0].roomType.price *
      dto.roomNumber *
      Math.floor(
        (dto.checkOut.getTime() - dto.checkIn.getTime()) / (1000 * 3600 * 24)
      );
    this.mailService.sendEmailReservation(
      user.email,
      'Bạn đã đặt phòng thành công',
      {
        username: user.name,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        guestCount: dto.guestCount,
        property: rooms[0].roomType.property.name,
        totalPrice
      }
    );
    return {
      orderId: reservation.id,
      amount: totalPrice
    };
  }

  async findAll(query: PageOptionsDto) {
    const { page } = query;
    const reservations = await this.reservation.findMany({
      skip: (page - 1) * 10,
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    return reservations;
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
        review: {
          select: {
            id: true,
            content: true,
            rating: true,
            createdAt: true
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
                    photos: true,
                    bedType: true,
                    maxGuests: true,
                    size: true,
                    property: {
                      select: {
                        id: true,
                        name: true,
                        categoryId: true,
                        photos: true
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

    const numberOfRooms = rs.roomReserved.length;

    const { property, ...roomType } = rs.roomReserved[0].room.roomType;
    return {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      review: rs.review,
      id: rs.id,
      checkIn: rs.checkIn,
      checkOut: rs.checkOut,
      status: rs.status,
      specialRequest: rs.specialRequest,
      property,
      roomType,
      totalPrice: getReservationPrice(
        rs.checkOut,
        rs.checkIn,
        rs.roomReserved[0].room.roomType.price,
        numberOfRooms
      ),
      numberOfRooms,
      numberOfGuests: rs.guestCount
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
                        categoryId: true,
                        photos: true
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
    // count total price  of reservation
    const result = rs.map(reservation => {
      const totalPrice = getReservationPrice(
        reservation.checkOut,
        reservation.checkIn,
        reservation.roomReserved[0].room.roomType.price,
        reservation.roomReserved.length
      );
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
        id: true,
        status: true,
        userId: true,
        roomReserved: {
          select: {
            roomId: true,
            room: {
              select: {
                roomType: {
                  select: {
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
      id: reservation.id,
      userId: reservation.userId,
      property: reservation.roomReserved[0].room.roomType.property,
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
      await this.reservation.update({
        where: {
          id: reservation.id
        },
        data: {
          status: StatusReservation.CANCELLED
        }
      });
    });
  }
}

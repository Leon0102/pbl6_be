import { db } from '@common/utils/dbClient';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  private readonly room = db.room;
  private readonly reservations = db.reservation;

  async deleteMany(listIds: string[], tx: Prisma.TransactionClient) {
    await tx.room.deleteMany({
      where: {
        id: {
          in: listIds
        }
      }
    });
  }

  async delete(id: string) {
    await db.room.delete({
      where: {
        id
      }
    });
  }

  async getDetails(id: string) {
    return await db.room.findUnique({
      where: {
        id
      }
    });
  }

  async getListRoomsAvailableByRoomType(
    roomTypeId: string,
    numberOfRoom: number,
    checkIn: Date,
    checkOut: Date
  ) {
    const rs = await this.room.findMany({
      select: {
        id: true,
        roomReserved: {
          select: {
            reservation: {
              select: {
                id: true,
                checkIn: true,
                checkOut: true
              }
            }
          }
        },
        roomType: {
          select: {
            roomCount: true,
            price: true,
            property: {
              select: {
                name: true
              }
            }
          }
        }
      },
      where: {
        roomTypeId: roomTypeId
      }
    });
    const roomsAvailable = rs.filter(room => {
      const roomReserved = room.roomReserved;
      if (roomReserved.length === 0) {
        return true;
      }
      if (
        roomReserved.some(r => {
          const checkInReserved = new Date(r.reservation.checkIn);
          const checkOutReserved = new Date(r.reservation.checkOut);
          return checkInReserved <= checkOut && checkOutReserved >= checkIn;
        })
      ) {
        return false;
      }
      return true;
    });

    if (roomsAvailable.length < numberOfRoom) {
      throw new BadRequestException('Not enough room');
    }

    return roomsAvailable;
  }

  async getAllRoomsInRoomTypes(roomTypeId: string) {
    return await this.room.findMany({
      where: {
        roomTypeId: roomTypeId
      }
    });
  }

  async updateStatusRoom(id: string, status: RoomStatus) {
    return await db.room.update({
      where: {
        id
      },
      data: {
        status,
        isDeleted: false
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleCron() {
    const rooms = await this.room.findMany({
      where: {
        status: 'UNAVAILABLE',
        isDeleted: false
      },
      select: {
        id: true,
        roomReserved: {
          select: {
            reservation: {
              select: {
                checkOut: true
              }
            }
          }
        }
      }
    });
    const today = new Date();
    for (const room of rooms) {
      const checkOut = new Date(room.roomReserved[0].reservation.checkOut);
      if (today > checkOut) {
        await this.updateStatusRoom(room.id, 'AVAILABLE');
      }
    }
  }
}

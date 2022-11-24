import { db } from '@common/utils/dbClient';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  private readonly room = db.room;
  async createMany(
    typeInfo: {
      id: number;
      roomCount: number;
    },
    tx: Prisma.TransactionClient
  ) {
    console.log(typeInfo);
  }

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

  async getListRoomsByListIds(listIds: string[]) {
    return await this.room.findMany({
      where: {
        id: {
          in: listIds
        }
      }
    });
  }

  async getAllRoomsInRoomTypes(roomTypeId: string) {
    return await this.room.findMany({
      where: {
        roomTypeId
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

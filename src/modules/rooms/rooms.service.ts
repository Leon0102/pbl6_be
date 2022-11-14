import { db } from '@common/utils/dbClient';
import { Injectable } from '@nestjs/common';
import { Prisma, RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {

  private readonly room = db.room;
  async createMany(
    typeInfo: {
      id: number;
      roomCount: number;
    },
    tx: Prisma.TransactionClient,
  ) {
    console.log(typeInfo);
  }

  async deleteMany(
    listIds: string[],
    tx: Prisma.TransactionClient,
  ) {
    await tx.room.deleteMany({
      where: {
        id: {
          in: listIds,
        },
      },
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput) {
    // await .room.update({
    //   where: {
    //     id,
    //   },
    //   data,
    // });
  }

  async delete(id: number) {
    // await db.room.delete({
    //   where: {
    //     id,
    //   },
    // });
  }

  async getDetails(id: number) {
    // return await db.room.findUnique({
    //   where: {
    //     id,
    //   },
    // });
    //
  }

  async updateStatusRoom(id: string, status: RoomStatus) {
    return await db.room.update({
      where: {
        id
      },
      data: {
        status,
        isActive: false
      }
    })
  }
}

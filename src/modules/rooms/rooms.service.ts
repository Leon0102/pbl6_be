import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsService {
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
    listIds: number[],
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

  async update(id: number, data: Prisma.RoomUpdateInput) {
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
}

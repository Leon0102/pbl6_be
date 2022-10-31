import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { db } from '@common/utils/dbClient';

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
}

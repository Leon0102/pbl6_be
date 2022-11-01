import { Injectable } from '@nestjs/common';
import { db } from '@common/utils/dbClient';
import { CreateRoomTypeDto } from './dtos/create-room-type.dto';
import { Prisma } from '@prisma/client';
import { RoomsService } from '@modules/rooms/rooms.service';
@Injectable()
export class RoomTypesService {
  private readonly roomTypes = db.roomType;
  constructor(private readonly roomsService: RoomsService) {}
  createMany(propertyId: number, roomTypes: CreateRoomTypeDto[]) {
    roomTypes.forEach(async (roomType) => {
      await this.roomTypes.create({
        data: {
          name: roomType.name,
          description: roomType.description,
          price: roomType.price,
          roomCount: roomType.roomCount,
          maxGuests: roomType.maxGuests,
          size: {
            ...roomType.size,
          },
          facilities: {
            ...roomType.facilities,
          },
          rooms: {
            createMany: {
              data: Array.from({ length: roomType.roomCount }).map(() => ({})),
            },
          },
          photos: {
            createMany: {
              data: roomType.images.map((image) => ({ url: image })),
            },
          },
          property: {
            connect: {
              id: propertyId,
            },
          },
        },
      });
    });
  }
  async create(
    propertyId: number,
    roomType: CreateRoomTypeDto,
    tx: Prisma.TransactionClient,
  ) {
    await tx.roomType.create({
      data: {
        name: roomType.name,
        description: roomType.description,
        price: roomType.price,
        roomCount: roomType.roomCount,
        maxGuests: roomType.maxGuests,
        size: {
          ...roomType.size,
        },
        facilities: {
          ...roomType.facilities,
        },
        propertyId,
        rooms: {
          createMany: {
            data: Array.from({ length: roomType.roomCount }).map(() => ({})),
          },
        },
      },
    });
  }
}

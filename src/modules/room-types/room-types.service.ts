import { db } from '@common/utils/dbClient';
import { RoomsService } from '@modules/rooms/rooms.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomTypeDto } from './dtos/create-room-type.dto';
import { UpdateRoomTypeDto } from './dtos/update-room-type.dto';
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
          photos: roomType.images,
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
  ) {
    await db.roomType.create({
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

  async update(id: number, propertyId: number, roomType: UpdateRoomTypeDto) {
    const property = await this.roomTypes.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        rooms: true,
      },
    });

    if (property.rooms.find(room => room.roomTypeId !== id)) {
      throw new BadRequestException('Cannot update room type with rooms');
    }

    if (property.rooms.find((room) => room.status !== 'AVAILABLE')) {
      throw new BadRequestException('Cannot update room type with booked rooms');
    }

    await this.roomTypes.update({
      where: {
        id,
      },
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
        }
      },
    });

    return {
      message: 'Room type updated successfully',
    };
  }

  async remove(id: number, propertyId: number) {
    const property = await this.roomTypes.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        rooms: true,
      },
    });

    if (property.rooms.find(room => room.roomTypeId !== id)) {
      throw new BadRequestException('Cannot delete room type with rooms');
    }

    await this.roomTypes.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      message: 'Room type deleted successfully',
    };
  }

  async getRoomType(id: number) {
    return await this.roomTypes.findUnique({
      where: {
        id,
      },
      include: {
        rooms: true,
      },
    });
  }
}

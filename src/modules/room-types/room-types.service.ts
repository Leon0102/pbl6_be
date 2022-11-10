import { db } from '@common/utils/dbClient';
import { RoomsService } from '@modules/rooms/rooms.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { CreateRoomTypeDto } from './dtos/create-room-type.dto';
import { UpdateRoomTypeDto } from './dtos/update-room-type.dto';
@Injectable()
export class RoomTypesService {
  private readonly roomTypes = db.roomType;
  constructor(
    private readonly roomsService: RoomsService,
    private readonly supabaseService: SupabaseService,
  ) {}
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
    userId: number,
    propertyId: number,
    roomType: CreateRoomTypeDto,
  ) {
    // check if property belongs to user
    const propertyBelongsToUser = await db.property.findFirst({
      where: {
        id: propertyId,
        userId,
      },
    });

    if (!propertyBelongsToUser) {
      throw new NotFoundException('Property not found');
    }

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

  async createRoomType(userId: number, propertyId: number, roomType: CreateRoomTypeDto, files: Express.Multer.File[]) {
    // check if property belongs to user
    const propertyBelongsToUser = await db.property.findFirst({
      where: {
        id: propertyId,
        userId,
      },
    });

    // upload images to cloudinary
    const images = await Promise.all(
      roomType.images.map(async (image) => {
        if (files.find((file) => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find((file) => file.originalname === image),
          );
        }
      }),
    );
    if (!propertyBelongsToUser) {
      throw new NotFoundException('Property not found');
    }

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
        photos: images,
        propertyId,
        rooms: {
          createMany: {
            data: Array.from({ length: roomType.roomCount }).map(() => ({})),
          },
        },
      },
    });

    return {
      message: 'Room type created successfully',
    };
  }

  async update(userId: number, id: number, roomType: UpdateRoomTypeDto, files: Express.Multer.File[]) {
    // check if room type belongs to user
    const roomTypeBelongsToUser = await this.roomTypes.findFirstOrThrow({
      where: {
        id,
        property: {
          userId,
        },
      },
    });

    if (!roomTypeBelongsToUser) {
      throw new BadRequestException('Room type does not belong to user');
    }

    if (files.length > 0) {

      // delete old images
      roomTypeBelongsToUser.photos.forEach(async (image) => {
        await this.supabaseService.deleteFile(image);
      });

      // upload images to cloudinary
      const images = await Promise.all(
        roomType.images.map(async (image) => {
          if (files.find((file) => file.originalname === image)) {
            return await this.supabaseService.uploadFile(
              files.find((file) => file.originalname === image),
            );
          }
        }),
      );
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

  async remove(userId: number, id: number) {
    // check if room type belongs to user
    const roomTypeBelongsToUser = await this.roomTypes.findFirst({
      where: {
        id,
        property: {
          userId,
        },
      },
    });

    if (!roomTypeBelongsToUser) {
      throw new BadRequestException('Room type does not belong to user');
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
    const rs = await this.roomTypes.findUnique({
      where: {
        id,
      },
      include: {
        rooms: true,
      },
    });

    if (!rs) {
      throw new NotFoundException('Room type not found');
    }

    return rs;
  }

}

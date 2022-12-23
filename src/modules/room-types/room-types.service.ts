import { db } from '@common/utils/dbClient';
import { RoomsService } from '@modules/rooms/rooms.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ParseUUIDPipe
} from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto';

@Injectable()
export class RoomTypesService {
  private readonly roomTypes = db.roomType;
  private readonly rooms = db.room;
  constructor(
    private readonly roomsService: RoomsService,
    private readonly supabaseService: SupabaseService
  ) {}
  createMany(propertyId: string, roomTypes: CreateRoomTypeDto[]) {
    roomTypes.forEach(async roomType => {
      await this.roomTypes.create({
        data: {
          name: roomType.name,
          description: roomType.description,
          price: roomType.price,
          roomCount: roomType.roomCount,
          maxGuests: roomType.maxGuests,
          bedType: roomType.bedType,
          size: {
            ...roomType.size
          },
          facilities: {
            ...roomType.facilities
          },
          rooms: {
            createMany: {
              data: Array.from({ length: roomType.roomCount }).map(() => ({}))
            }
          },
          photos: roomType.images,
          property: {
            connect: {
              id: propertyId
            }
          }
        }
      });
    });
  }

  async create(
    userId: string,
    propertyId: string,
    roomType: CreateRoomTypeDto,
    files: Express.Multer.File[]
  ) {
    // check if property belongs to user
    const propertyBelongsToUser = await db.property.findFirst({
      where: {
        id: propertyId,
        userId
      }
    });

    // upload images to cloudinary
    const images = await Promise.all(
      roomType.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image)
          );
        }
      })
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
        bedType: roomType.bedType,
        size: {
          ...roomType.size
        },
        facilities: {
          ...roomType.facilities
        },
        photos: images,
        propertyId,
        rooms: {
          createMany: {
            data: Array.from({ length: roomType.roomCount }).map(() => ({}))
          }
        }
      }
    });

    return {
      message: 'Room type created successfully'
    };
  }

  async update(
    userId: string,
    id: string,
    roomType: UpdateRoomTypeDto,
    files: Express.Multer.File[]
  ) {
    // check if room type belongs to user
    const roomTypeBelongsToUser = await this.roomTypes.findFirstOrThrow({
      where: {
        id,
        property: {
          userId
        }
      }
    });

    if (!roomTypeBelongsToUser) {
      throw new BadRequestException('Room type does not belong to user');
    }

    // delete old images
    roomTypeBelongsToUser.photos.forEach(async image => {
      if (!roomType.images.includes(image)) {
        await this.supabaseService.deleteFile(image);
      }
    });

    // upload images to cloudinary
    const images = await Promise.all(
      roomType.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image)
          );
        } else {
          return image;
        }
      })
    );

    await this.roomTypes.update({
      where: {
        id
      },
      data: {
        name: roomType.name,
        description: roomType.description,
        price: roomType.price,
        roomCount: roomType.roomCount,
        maxGuests: roomType.maxGuests,
        bedType: roomType.bedType,
        photos: images,
        size: {
          ...roomType.size
        },
        facilities: {
          ...roomType.facilities
        }
      }
    });

    return {
      message: 'Room type updated successfully'
    };
  }

  async remove(userId: string, id: string) {
    // check if room type belongs to user
    const roomTypeBelongsToUser = await this.roomTypes.findFirst({
      where: {
        id,
        property: {
          userId
        }
      }
    });

    if (!roomTypeBelongsToUser) {
      throw new BadRequestException('Room type does not belong to user');
    }

    await this.roomTypes.update({
      where: {
        id
      },
      data: {
        isDeleted: true
      }
    });

    return {
      message: 'Room type deleted successfully'
    };
  }

  async getRoomType(userId: string, id: string) {
    const roomType = await this.roomTypes.findFirst({
      where: {
        id
      }
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    return roomType;
  }

  getRoomTypesOfProperty(userId: string, propertyId: string) {
    return this.roomTypes.findMany({
      where: {
        property: {
          id: propertyId,
          userId
        }
      }
    });
  }

  getAllRoomsInRoomTypes(roomTypeId: string) {
    return this.roomsService.getAllRoomsInRoomTypes(roomTypeId);
  }
  async getListRoomTypesAvailable(
    numberOfGuests: number,
    numberOfRoom: number,
    checkIn: Date,
    checkOut: Date,
    propertyId?: string
  ) {
    const guestsEachRoom = Math.ceil(numberOfGuests / numberOfRoom);
    const rs = await this.roomTypes.findMany({
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        price: true,
        roomCount: true,
        maxGuests: true,
        rooms: {
          select: {
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
            }
          }
        },
        property: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        price: 'asc'
      }
    });
    const roomTypesAvailable = rs.map(roomType => {
      // filter rooms which overlap with checkIn and checkOut
      roomType.rooms = roomType.rooms.filter(room => {
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
      // check if rooms of roomtype is enough and maxGuests of roomtype is enough
      if (
        roomType.rooms.length >= numberOfRoom &&
        roomType.maxGuests >= guestsEachRoom
      ) {
        return roomType;
      }
      return null;
    });
    return roomTypesAvailable
      .filter(
        r => r != null && (propertyId ? r.property.id === propertyId : true)
      )
      .map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        maxGuests: r.maxGuests,
        roomsCount: r.roomCount,
        roomsAvailable: r.rooms.length,
        property: r.property
      }));
  }
}

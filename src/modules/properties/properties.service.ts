import { Categories } from '@common/constants/category-type.enum';
import { db } from '@common/utils/dbClient';
import { RoomTypesService } from '@modules/room-types/room-types.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Property } from '@prisma/client';
import { SupabaseService } from '../../shared/supabase.service';
import { CreatePropertyDto, SearchPropertyDto, UpdatePropertyDto } from './dto';
@Injectable()
export class PropertiesService {
  private readonly properties = db.property;
  constructor(
    private readonly roomTypesService: RoomTypesService,
    private readonly supabaseService: SupabaseService,
  ) {}
  async findByPage(page: number) {
    try {
      const numberOfPropsPerPage = 10;
      const results = await this.properties.findMany({
        skip: (page - 1) * numberOfPropsPerPage,
        take: numberOfPropsPerPage,
        where: {
          isDeleted: false,
        },
        include: {
          roomTypes: {
            where: {
              isDeleted: false,
              rooms: {
                some: {
                  isActive: true,
                  status: 'AVAILABLE',
                },
              },
            },
            select: {
              price: true,
            },
            orderBy: {
              price: 'asc',
            },
          },
        },
      });

      return results;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const prop = await this.properties.findFirstOrThrow({
        where: {
          id,
          isDeleted: false,
        },
        include: {
          ward: {
            select: {
              name: true,
              district: {
                select: {
                  name: true,
                  province: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          roomTypes: {
            where: {
              isDeleted: false,
            },
            include: {
              _count: {
                select: {
                  rooms: {
                    where: {
                      isActive: true,
                      status: 'AVAILABLE',
                    },
                  },
                },
              },
            },
          },
        },
      });
      return prop;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Property not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(
    userId: string,
    property: CreatePropertyDto,
    files: Express.Multer.File[],
  ): Promise<boolean> {
    property.images = await Promise.all(
      property.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image),
          );
        }
      }),
    );

    property.roomTypes = await Promise.all(
      property.roomTypes.map(async roomType => {
        roomType.images = await Promise.all(
          roomType.images.map(async image => {
            if (files.find(file => file.originalname === image)) {
              return await this.supabaseService.uploadFile(
                files.find(file => file.originalname === image),
              );
            }
          }),
        );
        return roomType;
      }),
    );

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const prop = await tx.property.create({
        data: {
          name: property.name,
          description: property.description,
          latitude: property.latitude,
          longitude: property.longitude,
          streetAddress: property.streetAddress,
          facilities: {
            ...property.facilities,
          },
          roomCount: property.roomCount,
          user: {
            connect: {
              id: userId,
            },
          },
          ward: {
            connect: {
              code: property.wardCode,
            },
          },
          photos: property.images,
          category: {
            connect: {
              id: Categories[property.categoryId],
            },
          },
        },
      });
      try {
        this.roomTypesService.createMany(prop.id, property.roomTypes);
      } catch (error) {
        await db.property.delete({
          where: {
            id: prop.id,
          },
        });
        return false;
      }
    });
    return true;
  }

  async checkPropertyOwner(userId: string, propertyId: string) {
    const prop = await this.properties.findFirst({
      where: {
        id: propertyId,
        userId,
      },
    });
    return !!prop;
  }

  async remove(userId: string, id: string) {
    if (!(await this.checkPropertyOwner(userId, id))) {
      throw new NotFoundException('Property not found');
    }
    await this.properties.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      message: 'Delete property successfully',
    };
  }

  async update(
    userId: string,
    id: string,
    property: UpdatePropertyDto,
    files: Express.Multer.File[],
  ) {
    if (!(await this.checkPropertyOwner(userId, id))) {
      throw new NotFoundException('Property not found');
    }

    const currProperty = await this.properties.findFirst({
      where: {
        id,
      },
    });

    currProperty.photos.forEach(async image => {
      await this.supabaseService.deleteFile(image);
    });

    property.images = await Promise.all(
      property.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image),
          );
        }
      }),
    );

    await this.properties.update({
      where: {
        id,
      },
      data: {
        name: property.name,
        description: property.description,
        latitude: property.latitude,
        longitude: property.longitude,
        streetAddress: property.streetAddress,
        facilities: {
          ...property.facilities,
        },
        roomCount: property.roomCount,
        ward: {
          connect: {
            code: property.wardCode,
          },
        },
        photos: property.images,
        category: {
          connect: {
            id: Categories[property.categoryId],
          },
        },
      },
    });

    return {
      message: 'Update property successfully',
    };
  }

  getMyProperties(userId: string) {
    return this.properties.findMany({
      where: {
        userId,
      },
    });
  }

  // search property which location, room available, day checkin, day checkout, number of rooms, number of guests

  async search(search: SearchPropertyDto) {
    const { location, checkIn, checkOut, rooms, guests, page } = search;
    // get all properties in ward with updated_at between checkIn and checkOut and rooms available and >= rooms and maxGuests >= guests and 1 page take 10 properties
    const properties = await this.properties.findMany({
      take: page * 10,
      skip: (page - 1) * 10,
      where: {
        OR: [
          {
            ward: {
              code: location,
            },
          },
          {
            ward: {
              district: {
                code: location,
              },
            },
          },
          {
            ward: {
              district: {
                province: {
                  code: location,
                },
              },
            },
          },
        ],
        roomTypes: {
          some: {
            rooms: {
              some: {
                AND: [
                  {
                    isActive: true,
                    status: 'AVAILABLE',
                  },
                  {
                    updatedAt: {
                      gte: checkIn,
                      lte: checkOut,
                    },
                  },
                ],
              },
            },
            maxGuests: {
              gte: guests,
            },
          },
        },
      },
      include: {
        roomTypes: {
          select: {
            _count: {
              select: {
                rooms: {
                  where: {
                    isActive: true,
                    status: 'AVAILABLE',
                  },
                },
              },
            },
          },
        },
      },
    });
    const result = properties.filter(property => {
      return property.roomTypes.some(roomType => {
        return roomType._count.rooms >= rooms;
      });
    });
    return result;
  }
}

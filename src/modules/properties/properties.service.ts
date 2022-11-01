import { Injectable } from '@nestjs/common';
import { db } from '@common/utils/dbClient';
import { Prisma, Property } from '@prisma/client';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { Categories } from '@common/constants';
import { RoomTypesService } from '@modules/room-types/room-types.service';
import { RoomTypeDto } from '@modules/room-types/dtos/room-type.dto';
@Injectable()
export class PropertiesService {
  private readonly properties = db.property;
  constructor(private readonly roomTypesService: RoomTypesService) {}
  async findByPage(page: number) {
    const numberOfPropsPerPage = 10;
    const results = await this.properties.findMany({
      skip: (page - 1) * numberOfPropsPerPage,
      take: numberOfPropsPerPage,
      where: {
        isDeleted: false,
      },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
          },
        },
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
  }

  async findOne(id: number): Promise<Property> {
    const prop = await this.properties.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
          },
        },
        roomTypes: {
          where: {
            isDeleted: false,
          },
          include: {
            photos: {
              select: {
                id: true,
                url: true,
              },
            },
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
  }

  async create(userId: number, property: CreatePropertyDto): Promise<boolean> {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const prop = await tx.property.create({
        data: {
          name: property.name,
          description: property.description,
          latitude: property.latitude,
          location: {
            ...property.location,
          },
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
          photos: {
            createMany: {
              data: property.images.map((image) => ({ url: image })),
            },
          },
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

  async update(id: number, property: any) {}

  async remove(id: number) {
    await this.properties.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}

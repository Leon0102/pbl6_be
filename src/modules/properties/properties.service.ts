import { Categories } from '@common/constants/category-type.enum';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { db } from '@common/utils/dbClient';
import { RoomTypesService } from '@modules/room-types/room-types.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { SupabaseService } from '../../shared/supabase.service';
import {
  CreatePropertyDto,
  SearchPropertyDto,
  UpdatePropertyDto
} from './dto';

@Injectable()
export class PropertiesService {
  private readonly properties = db.property;
  constructor(
    private readonly roomTypesService: RoomTypesService,
    private readonly supabaseService: SupabaseService
  ) {}

  async findAll(query: PageOptionsDto) {
    const { page } = query;
    try {
      const properties = await this.properties.findMany({
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          name: true,
          isVerified: true,
          createdAt: true,
          streetAddress: true,
          categoryId: true,
          roomTypes: {
            where: {
              isDeleted: false
            },
            orderBy: {
              price: 'asc'
            },
            select: {
              name: true,
              price: true,
              photos: true,
              maxGuests: true,
              size: true,
              bedType: true,
            }
          },
          ward: {
            select: {
              fullName: true,
              district: {
                select: {
                  fullName: true,
                  province: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      const result = await Promise.all(
        properties.map(async prop => {
          const avgRating = await db.review.aggregate({
            where: {
              propertyId: prop.id
            },
            _avg: {
              rating: true
            }
          });

          return {
            ...prop,
            rating: avgRating._avg.rating
          };
        })
      );
      const totalPage = Math.ceil(result.length / 10);
      const totalProperties = result.length;
      const newResult = result.slice((page - 1) * 10, page * 10);
      return {
        properties: newResult,
        currentPage: page,
        totalPage: totalPage ? totalPage : 1,
        totalProperties
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string) {
    try {
      const prop = await this.properties.findFirst({
        where: {
          id,
          isDeleted: false
        },
        include: {
          ward: {
            select: {
              fullName: true,
              district: {
                select: {
                  fullName: true,
                  province: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          roomTypes: {
            where: {
              isDeleted: false
            },
            orderBy: {
              price: 'asc'
            },
            include: {
              _count: {
                select: {
                  rooms: {
                    where: {
                      isDeleted: false,
                      status: 'AVAILABLE'
                    }
                  }
                }
              }
            }
          }
        }
      });

      const avgRating = await db.review.aggregate({
        where: {
          propertyId: id
        },
        _avg: {
          rating: true
        }
      });

      return {
        ...prop,
        rating: avgRating._avg.rating
      };
    } catch (error) {
      console.log(error);
    }
  }

  async create(
    userId: string,
    property: CreatePropertyDto,
    files: Express.Multer.File[]
  ): Promise<boolean> {
    property.images = await Promise.all(
      property.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image)
          );
        }
      })
    );

    property.roomTypes = await Promise.all(
      property.roomTypes.map(async roomType => {
        roomType.images = await Promise.all(
          roomType.images.map(async image => {
            if (files.find(file => file.originalname === image)) {
              return await this.supabaseService.uploadFile(
                files.find(file => file.originalname === image)
              );
            }
          })
        );
        return roomType;
      })
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
            ...property.facilities
          },
          roomCount: property.roomCount,
          user: {
            connect: {
              id: userId
            }
          },
          ward: {
            connect: {
              code: property.wardCode
            }
          },
          photos: property.images,
          category: {
            connect: {
              id: Categories[property.categoryId]
            }
          }
        }
      });
      try {
        this.roomTypesService.createMany(prop.id, property.roomTypes);
      } catch (error) {
        await db.property.delete({
          where: {
            id: prop.id
          }
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
        userId
      }
    });
    return !!prop;
  }

  async remove(user: User, id: string) {
    if (user.roleId !== 'admin') {
      if (!(await this.checkPropertyOwner(user.id, id))) {
        throw new NotFoundException('Property not found');
      }
    }
    await this.properties.update({
      where: {
        id
      },
      data: {
        isDeleted: true
      }
    });

    return {
      message: 'Delete property successfully'
    };
  }

  async update(
    userId: string,
    id: string,
    property: UpdatePropertyDto,
    files: Express.Multer.File[]
  ) {
    if (!(await this.checkPropertyOwner(userId, id))) {
      throw new NotFoundException('Property not found');
    }

    const currProperty = await this.properties.findFirst({
      where: {
        id
      }
    });

    currProperty.photos.forEach(async image => {
      await this.supabaseService.deleteFile(image);
    });

    property.images = await Promise.all(
      property.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image)
          );
        }
      })
    );

    await this.properties.update({
      where: {
        id
      },
      data: {
        name: property.name,
        description: property.description,
        latitude: property.latitude,
        longitude: property.longitude,
        streetAddress: property.streetAddress,
        facilities: {
          ...property.facilities
        },
        roomCount: property.roomCount,
        ward: {
          connect: {
            code: property.wardCode
          }
        },
        photos: property.images,
        category: {
          connect: {
            id: Categories[property.categoryId]
          }
        }
      }
    });

    return {
      message: 'Update property successfully'
    };
  }

  getMyProperties(userId: string) {
    return this.properties.findMany({
      where: {
        userId
      }
    });
  }

  // search property which location, room available, day checkin, day checkout, number of rooms, number of guests

  async search(search: SearchPropertyDto) {
    const {
      location,
      checkIn,
      checkOut,
      rooms,
      guests,
      page,
      orderBy,
      category,
      startPrice,
      endPrice
    } = search;
    // get all properties in ward with updated_at between checkIn and checkOut and rooms available and >= rooms and maxGuests >= guests and 1 page take 10 properties
    const properties = await this.properties.findMany({
      include: {
        ward: {
          select: {
            fullName: true,
            district: {
              select: {
                fullName: true,
                province: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        roomTypes: {
          select: {
            price: true
          },
          orderBy: {
            price: 'asc'
          }
        }
      },
      where: {
        isVerified: true,
        OR: [
          {
            ward: {
              code: location
            }
          },
          {
            ward: {
              district: {
                code: location
              }
            }
          },
          {
            ward: {
              district: {
                province: {
                  code: location
                }
              }
            }
          }
        ],
        roomTypes: {
          some: {
            maxGuests: {
              gte: guests
            }
          }
        },
        roomCount: {
          gte: rooms
        },
        NOT: {
          roomTypes: {
            some: {
              rooms: {
                some: {
                  roomReserved: {
                    some: {
                      reservation: {
                        checkIn: {
                          lte: checkOut
                        },
                        checkOut: {
                          gte: checkIn
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    let newResult = properties.map(property => {
      let avgRating =
        property.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
        property.reviews.length;
      delete property.reviews;
      return {
        ...property,
        avgRating
      };
    });
    switch (orderBy) {
      case 'price.asc':
        newResult = newResult.sort(
          (a, b) => a.roomTypes[0].price - b.roomTypes[0].price
        );
        break;
      case 'price.desc':
        newResult = newResult.sort(
          (a, b) => b.roomTypes[0].price - a.roomTypes[0].price
        );
        break;
      case 'rating.asc':
        newResult = newResult.sort((a, b) => a.avgRating - b.avgRating);
        break;
      case 'rating.desc':
        newResult = newResult.sort((a, b) => b.avgRating - a.avgRating);
        break;
      default:
        break;
    }

    if (category) {
      const categoryArr = category.split(',');
      newResult = newResult.filter(property =>
        categoryArr.includes(property.categoryId)
      );
    }
    if (startPrice || endPrice) {
      newResult = newResult.filter(
        property =>
          property.roomTypes[0].price >= (startPrice || 0) &&
          property.roomTypes[0].price <= endPrice
      );
    }
    const totalPage = Math.ceil(newResult.length / 10);
    const totalProperties = newResult.length;
    const result = newResult.slice((page - 1) * 10, page * 10);
    return {
      properties: result,
      currentPage: page,
      totalPage: totalPage ? totalPage : 1,
      totalProperties
    };
  }

  getRoomTypesOfProperty(userId: string, propertyId: string) {
    return this.roomTypesService.getRoomTypesOfProperty(userId, propertyId);
  }

  async verifyProperty(propertyId: string) {
    await this.properties.update({
      where: {
        id: propertyId
      },
      data: {
        isVerified: !(await this.properties.findFirstOrThrow({
          where: {
            id: propertyId
          }
        })).isVerified
      }
    });

    return {};
  }
}

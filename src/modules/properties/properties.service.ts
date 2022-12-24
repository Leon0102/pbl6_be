import { Categories } from '@common/constants/category-type.enum';
import { db } from '@common/utils/dbClient';
import { RoomTypesService } from '@modules/room-types/room-types.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Property, User } from '@prisma/client';
import { SupabaseService } from '../../shared/supabase.service';
import { CreatePropertyDto, SearchPropertyDto, UpdatePropertyDto } from './dto';
import { FilterPropertyDto } from './dto/filter-property.dto';

@Injectable()
export class PropertiesService {
  private readonly properties = db.property;
  constructor(
    private readonly roomTypesService: RoomTypesService,
    private readonly supabaseService: SupabaseService
  ) {}

  async findAll(query: FilterPropertyDto) {
    const { page, isVerified, searchKey, order, sortBy } = query;
    try {
      const properties = await this.properties.findMany({
        where: {
          isDeleted: false,
          isVerified:
            isVerified === 'true'
              ? true
              : isVerified === 'false'
              ? false
              : undefined,
          OR: [
            {
              name: {
                contains: searchKey
              }
            }
          ]
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
              bedType: true
            }
          },
          ward: {
            select: {
              code: true,
              fullName: true,
              district: {
                select: {
                  code: true,
                  fullName: true,
                  province: {
                    select: {
                      code: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      let result = await Promise.all(
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

      if (sortBy && order) {
        result = result.sort((a, b) => {
          if (order === 'ASC') {
            return a[sortBy] > b[sortBy] ? 1 : -1;
          } else {
            return a[sortBy] < b[sortBy] ? 1 : -1;
          }
        });
      }

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
              code: true,
              fullName: true,
              district: {
                select: {
                  code: true,
                  fullName: true,
                  province: {
                    select: {
                      code: true,
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

  async findDetailsForGuest(id: string, query: SearchPropertyDto) {
    const { checkIn, checkOut, rooms, guests } = query;
    const roomTypesAvailable =
      await this.roomTypesService.getListRoomTypesAvailable(
        guests,
        rooms,
        checkIn,
        checkOut,
        id
      );
    // console.log(roomTypesAvailable);
    const property = await this.properties.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        ward: {
          select: {
            code: true,
            fullName: true,
            district: {
              select: {
                code: true,
                fullName: true,
                province: {
                  select: {
                    code: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        roomTypes: {
          where: {
            id: {
              in: roomTypesAvailable.map(roomType => roomType.id)
            }
          },
          orderBy: {
            price: 'asc'
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            reservation: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true
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
      ...property,
      roomTypes: property.roomTypes.map((roomType, idx) => ({
        ...roomType,
        roomsAvailable: roomTypesAvailable[idx].roomsAvailable
      })),
      rating: avgRating._avg.rating
    };
  }

  async create(
    userId: string,
    property: CreatePropertyDto,
    files: Express.Multer.File[]
  ): Promise<Property> {
    property.images = await Promise.all(
      property.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image)
          );
        }
      })
    );
    const prop = await this.properties.create({
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
    return prop;
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
      if (!property.images.includes(image)) {
        await this.supabaseService.deleteFile(image);
      }
    });

    property.images = await Promise.all(
      property.images.map(async image => {
        if (files.find(file => file.originalname === image)) {
          return await this.supabaseService.uploadFile(
            files.find(file => file.originalname === image)
          );
        } else {
          return image;
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

  async getMyProperties(userId: string) {
    const properties = await this.properties.findMany({
      where: {
        userId,
        isDeleted: false
      },
      include: {
        ward: {
          select: {
            code: true,
            fullName: true,
            district: {
              select: {
                code: true,
                fullName: true,
                province: {
                  select: {
                    code: true,
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
        }
      }
    });
    const newResult = properties.map(property => {
      const avgRating =
        property.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
        property.reviews.length;
      delete property.reviews;
      return {
        ...property,
        avgRating
      };
    });
    return newResult;
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
        isVerified: !(
          await this.properties.findFirstOrThrow({
            where: {
              id: propertyId
            }
          })
        ).isVerified
      }
    });

    return {};
  }

  test(userId: string, files: Express.Multer.File[], data: any) {
    return {
      message: 'Upload file successfully'
    };
  }

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

    const roomTypesAvailable =
      await this.roomTypesService.getListRoomTypesAvailable(
        guests,
        rooms,
        checkIn,
        checkOut
      );
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
            id: true,
            price: true
          },
          orderBy: {
            price: 'asc'
          }
        }
      },
      where: {
        id: {
          in: roomTypesAvailable.map(roomType => roomType.property.id)
        },
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
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    const mappedProperties = properties.map(property => ({
      ...property,
      roomTypes: property.roomTypes.filter(roomType => {
        const roomTypeAvailable = roomTypesAvailable.find(
          roomTypeAvailable => roomTypeAvailable.id === roomType.id
        );
        return roomTypeAvailable;
      })
    }));

    let newResult = mappedProperties.map(property => {
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
      currentPage: page,
      totalPage: totalPage ? totalPage : 1,
      totalProperties,
      properties: result
    };
  }
}

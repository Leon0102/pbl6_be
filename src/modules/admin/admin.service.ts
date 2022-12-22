import { Injectable } from '@nestjs/common';
import { NotificationType, ReservationStatus } from '@prisma/client';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {

  startDateOfYear = new Date(new Date().getFullYear(), 0, 1);
  endDateOfYear = new Date(new Date().getFullYear(), 12, 31);

  constructor(private readonly prisma: PrismaService) {}

  async getUsersEachMonth() {
    const result = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: this.startDateOfYear,
          lte: this.endDateOfYear
        },
      },
      select: {
        createdAt: true,
      },
    });
    const users = result.map((item) => {
      const date = new Date(item.createdAt);
      return date.getMonth();
    });
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const usersEachMonth = months.map((month, index) => {
      const count = users.filter((user) => user === index).length;
      return {
        count,
      };
    });
    return {
      months,
      usersEachMonth,
    };
  }

  async getPropertiesEachCategory() {
    const listCategories = await this.prisma.category.findMany();

    const result = await this.prisma.property.findMany({
      select: {
        category: true,
      },
    });
    const percents = await this.getPerCentsPropertiesOfCategoryEachMonth();
    const countPropertiesEachCategory = listCategories.map((category) => {
      const percentsPerCategory = percents.filter(
        (percent) => percent.category === category.name,
      );
      const count = result.filter(
        (property) => property.category.id === category.id,
      ).length;
      return {
        category: category.name,
        count,
        percent: percentsPerCategory[0].percent,
      };
    }
    );

    return countPropertiesEachCategory;

  }

  async getPerCentsPropertiesOfCategoryEachMonth() {
    const listCategories = await this.prisma.category.findMany();

    const listPropertiesThisMonth = await this.prisma.property.findMany({
      select: {
        category: true,
      },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
    });
    const countPropertiesEachCategory = listCategories.map((category) => {
      const count = listPropertiesThisMonth.filter(
        (property) => property.category.id === category.id,
      ).length;
      return {
        category: category.name,
        count,
      };
    }
    );

    const listPropertiesLastMonth = await this.prisma.property.findMany({
      select: {
        category: true,
      },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
      },
    });
    const countPropertiesEachCategoryLastMonth = listCategories.map(
      (category) => {
        const count = listPropertiesLastMonth.filter(
          (property) => property.category.id === category.id,
        ).length;
        return {
          category: category.name,
          count,
        };
      }
    );

    const percents = countPropertiesEachCategory.map((item, index) => {
      if (item.count === 0 && countPropertiesEachCategoryLastMonth[index].count === 0) {
        return {
          category: item.category,
          percent: 0,
        };
      }
      const percent = countPropertiesEachCategoryLastMonth[index].count === 0
        ? 100
        : Math.round(
          (item.count - countPropertiesEachCategoryLastMonth[index].count)
          / countPropertiesEachCategoryLastMonth[index].count * 100,
        );
      return {
        category: item.category,
        percent,
      };
    }
    );

    return percents;
  }

  async getTotal() {
    const totalUsers = await this.prisma.user.count();
    const totalProperties = await this.prisma.property.count();
    const totalAmountReservations = (
      await this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.CONFIRMED
        },
        include: {
          roomReserved: {
            select: {
              room: {
                select: {
                  id: true,
                  roomType: {
                    select: {
                      price: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    ).reduce(
      (acc, item) =>
        acc +
        item.roomReserved[0].room.roomType.price *
        item.roomReserved.length *
        Math.floor(
          (item.checkOut.getTime() - item.checkIn.getTime()) /
          (1000 * 3600 * 24)
        ),
      0
    );
    const percents = await this.getPercents();
    return {
      totalUsers,
      totalProperties,
      totalAmountReservations,
      ...percents,
    };
  }

  async getPercents() {
    const totalUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
    });
    const totalUsersLastMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
      },
    });
    const totalPropertiesThisMonth = await this.prisma.property.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
    });
    const totalPropertiesLastMonth = await this.prisma.property.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
      },
    });

    const totalAmountReservationsThisMonth = (await this.prisma.roomReserved.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
      select: {
        room: {
          select: {
            roomType: {
              select: {
                price: true,
              }
            },
          },
        },
      }
    })
    ).reduce((acc, item) => acc + item.room.roomType.price, 0);
    const totalAmountReservationsLastMonth = await (await this.prisma.roomReserved.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
      },
      select: {
        room: {
          select: {
            roomType: {
              select: {
                price: true,
              }
            },
          },
        },
      }
    })
    ).reduce((acc, item) => acc + item.room.roomType.price, 0);

    const percentUsers = totalUsersLastMonth === 0 ? 100 : Math.round(
      ((totalUsersThisMonth - totalUsersLastMonth) / totalUsersLastMonth) * 100,
    );
    const percentProperties = totalPropertiesLastMonth === 0 ? 100 : Math.round(
      ((totalPropertiesThisMonth - totalPropertiesLastMonth) /
        totalPropertiesLastMonth) * 100,
    );

    const percentAmountReservations = totalAmountReservationsLastMonth === 0 ? 100 : Math.round(
      ((totalAmountReservationsThisMonth - totalAmountReservationsLastMonth) /
        totalAmountReservationsLastMonth) * 100,
    );

    return {
      percentUsers,
      percentProperties,
      percentAmountReservations,
    };
  }

  async getAmountReservationsEachMonth() {
    const listAmountReservationsEachMonth = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.CONFIRMED
      },
      include: {
        roomReserved: {
          select: {
            room: {
              select: {
                id: true,
                roomType: {
                  select: {
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    });
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const amountReservationsEachMonth = months.map((month) => {
      const amount = listAmountReservationsEachMonth.map((item) => {
        if (item.checkIn.getMonth() === months.indexOf(month)) {
          return item.roomReserved[0].room.roomType.price *
            item.roomReserved.length *
            Math.floor(
              (item.checkOut.getTime() - item.checkIn.getTime()) /
              (1000 * 3600 * 24)
            );
        }
        return 0;
      }).reduce((acc, item) => acc + item, 0);
      return {
        month,
        amount,
      };
    });

    return amountReservationsEachMonth;
  }

  async getNotificationsFromAdmin(options: PageOptionsDto) {
    const { page } = options;
    const notifications = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.FROM_ADMIN,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const result = notifications.map((item) => {
      return {
        id: item.id,
        title: JSON.parse(JSON.stringify(item.context)).title,
        body: JSON.parse(JSON.stringify(item.context)).body,
        createdAt: item.createdAt,
      };
    });
    const totalPage = Math.ceil(result.length / 4);
    const totalUsers = result.length;
    const newResult = result.slice((page - 1) * 4, page * 4);
    return {
      notifications: newResult,
      totalPage,
      totalUsers,
      currentPage: page,
    };
  }
}

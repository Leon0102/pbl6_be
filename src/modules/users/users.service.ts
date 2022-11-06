import { User } from '.prisma/client';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  async createUser(user: CreateUserDto): Promise<any> {
    if (await this.getUserByEmail(user.email)) {
      throw new HttpException(
        {
          message: 'Người dùng với email này đã tồn tại',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const data: Prisma.UserCreateInput = {
      email: user.email,
      name: user.name,
      password: user.password,
      phone: user.phone,
      role: {
        connect: {
          id: user.role_id,
        },
      },
    };
    await this.prisma.user.create({
      data,
    });
    return {};
  }

  async deleteUser(id: number): Promise<User> {
    try {
      const rs = await this.prisma.user.delete({
        where: {
          id,
        },
      });
      delete rs.password;
      return rs;
    } catch (err) {
      console.log(err);
    }
  }

  async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    try {
      const rs = await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          email: user.email,
          name: user.name,
          password: user.password,
          phone: user.phone,
        },
      });
      delete rs.password;
      return rs;
    } catch (err) {
      console.log(err);
    }
  }
  async saveOrUpdateRefreshToken(
    refreshToken: string,
    id: number,
    refreshTokenExpires: Date,
  ) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken,
        refreshTokenExpiresAt: refreshTokenExpires,
      },
    });
  }
}

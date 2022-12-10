import { User } from '.prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePassword, UpdateUserDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon from 'argon2';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    });
    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }

  async createUser(user: CreateUserDto): Promise<any> {
    if (await this.getUserByEmail(user.email)) {
      throw new HttpException(
        {
          message: 'Người dùng với email này đã tồn tại'
        },
        HttpStatus.FORBIDDEN
      );
    }
    const data: Prisma.UserCreateInput = {
      email: user.email,
      name: user.name,
      password: user.password,
      phone: user.phone,
      role: {
        connect: {
          id: user.role_id
        }
      }
    };
    await this.prisma.user.create({
      data
    });
    return {};
  }

  async deleteUser(id: string): Promise<User> {
    try {
      const rs = await this.prisma.user.delete({
        where: {
          id
        }
      });
      delete rs.password;
      return rs;
    } catch (err) {
      console.log(err);
    }
  }

  async updateUser(id: string, user: UpdateUserDto): Promise<User> {
    try {
      const rs = await this.prisma.user.update({
        where: {
          id
        },
        data: {
          email: user.email,
          name: user.name,
          phone: user.phone
        }
      });
      delete rs.password;
      return rs;
    } catch (err) {
      throw new HttpException(
        {
          message: 'Cập nhật thất bại'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updatePassword(userId: string, dto: ChangePassword) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) {
      throw new HttpException(
        {
          message: 'Mật khẩu cũ không đúng'
        },
        HttpStatus.UNAUTHORIZED
      );
    }
    const hashedPassword = await argon.hash(dto.newPassword);

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashedPassword
      }
    });

    return {};
  }
  async saveOrUpdateRefreshToken(
    refreshToken: string,
    id: string,
    refreshTokenExpires: Date
  ) {
    await this.prisma.user.update({
      where: {
        id
      },
      data: {
        refreshToken,
        refreshTokenExpiresAt: refreshTokenExpires
      }
    });
  }
}

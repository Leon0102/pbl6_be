import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UsersService } from '@modules/users/users.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import * as randtoken from 'rand-token';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,

        private readonly usersService: UsersService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }

    async login(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }

        const pwMatches = await argon.verify(user.password, dto.password);
        if (!pwMatches) {
            throw new ForbiddenException('Invalid credentials');
        }
        const accessToken = await this.signToken(user.id, user.email,user.roleId);
        const refreshToken = await this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
        };
    }

    async signNewToken(email:string){
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        const accessToken = await this.signToken(user.id, user.email, user.roleId);
        const refreshToken = await this.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
        };
    }

    async signup(dto: CreateUserDto) {
        const hash = await argon.hash(dto.password);
        try {
            dto.password = hash;
            return this.usersService.createUser(dto);
        }
        catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    throw new ForbiddenException('Email already in use');
                }
            }
        }
    }

    async signToken(userId: number, email: string,roleId:string) {
        const payload = {
            sub: userId,
            email,
            roleId
        }

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: this.config.get('JWT_SECRET'),
        });
        return token;
    }
    async generateRefreshToken(userId: number): Promise<string> {
        const refreshToken = randtoken.generate(32);
        const expirydate = new Date();
        expirydate.setDate(expirydate.getDate() + 6);
        await this.usersService.saveOrUpdateRefreshToken(refreshToken, userId, expirydate);
        return refreshToken;
    }
}

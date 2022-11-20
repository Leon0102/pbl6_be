/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refreshtoken") {
    constructor(
        private userService: UsersService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('accessToken'),
            ignoreExpiration: true,
            secretOrKey: configService.get('JWT_SECRET'),
            passReqToCallback: true
        });
    }

    async validate(req: any, payload: any) {
        const user = await this.userService.getUserByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException();
        }
        if (user.refreshToken !== req.body.refreshToken) {
            throw new UnauthorizedException();
        }
        if (new Date() > new Date(user.refreshTokenExpiresAt)) {
            throw new UnauthorizedException();
        }
        return { id: user.id, email: user.email, password: user.password, refreshToken: user.refreshToken, refreshTokenExpiresAt: user.refreshTokenExpiresAt };
    }
}

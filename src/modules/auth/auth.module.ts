import { UsersModule } from '@modules/users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshTokenStrategy } from './strategy/jwt.refreshtoken.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({
  }),
    forwardRef(() => UsersModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,JwtRefreshTokenStrategy],
  exports: [AuthService]
})
export class AuthModule { }

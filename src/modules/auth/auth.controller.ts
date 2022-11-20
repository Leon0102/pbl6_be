import { User } from '.prisma/client';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { AuthDto } from './dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenDto })
  @UseGuards(AuthGuard('jwt-refreshtoken'))
  @Post('refresh-token')
  refreshToken(@GetUser() user: User) {
    return this.authService.signNewToken(user.email);
  }
}

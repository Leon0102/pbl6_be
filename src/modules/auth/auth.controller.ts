import { User } from '.prisma/client';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { AuthDto, ForgotPasswordDto, OTPDto } from './dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiOkResponse({ description: 'User created' })
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ description: 'User logged in' })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenDto })
  @ApiOperation({ summary: 'Refresh token' })
  @ApiOkResponse({ description: 'Token refreshed' })
  @UseGuards(AuthGuard('jwt-refreshtoken'))
  @Post('refresh-token')
  refreshToken(@GetUser() user: User) {
    return this.authService.signNewToken(user.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Generate OTP send to user email'
  })
  @ApiOperation({ summary: 'Forgot password' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }


  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'OTP verification successfully!'
  })
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOtp(@Body() dto: OTPDto) {
    return await this.authService.verifyOTP(dto);
  }
}

import { User } from '.prisma/client';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { Body, Controller, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { AuthGuard } from '@nestjs/passport';
import { ApiAcceptedResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import RoleGuard from '../../guards/roles.guard';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { AuthDto, ForgotPasswordDto, OTPDto, ResetPasswordDto } from './dto';
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
    const user = await this.authService.verifyOTP(dto);
    return this.authService.signNewToken(user.email);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(RoleGuard([RoleType.HOST, RoleType.GUEST]))
  @ApiAcceptedResponse({
    description: 'Reset password successfully'
  })
  @ApiOperation({ summary: 'Reset password' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}

import { User } from '.prisma/client';
import { AdminNotificationDto } from '@common/dto/create-notification.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { GetUser } from '@modules/auth/decorators';
import { ReservationsService } from '@modules/reservations/reservations.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { JwtGuard } from '../../guards';
import { NotificationsService } from '../../shared/notification.service';
import { ChangePassword, UpdateUserDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly reservationsService: ReservationsService,
    private readonly notificationsService: NotificationsService
  ) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  getMe(@GetUser() user: User) {
    return user;
  }
  @Get('me/reservations')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOkResponse({
    description: 'Get All Reservations Of Guest'
  })
  @ApiOperation({ summary: 'Get All Reservations Of Guest' })
  async getUserReservation(@GetUser() user: User) {
    return this.reservationsService.getUserReservation(user.id);
  }

  @Get('me/notifications')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOkResponse({
    description: 'Get All Reservations Of Guest'
  })
  @ApiOperation({ summary: 'Get All Reservations Of Guest' })
  async getUserNotifications(@GetUser() user: User) {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Get()
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all users' })
  getAll(@Query() query: PageOptionsDto) {
    return this.userService.getAllUsers(query);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch('')
  update(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.id, dto);
  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UseGuards(RoleGuard([RoleType.GUEST, RoleType.HOST]))
  @Patch('/password')
  updatePassword(@GetUser() user: User, @Body() dto: ChangePassword) {
    return this.userService.updatePassword(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send notification to all users' })
  @Post('/notifications')
  sendNotifications(@Body() dto: AdminNotificationDto) {
    return this.notificationsService.sendNotificationToAllUsers(dto);
  }
}

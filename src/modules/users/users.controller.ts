import { User } from '.prisma/client';
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
  ParseIntPipe,
  Patch,
  Post,
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
import { UpdateUserDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly reservationsService: ReservationsService,
    private readonly notificationsService: NotificationsService,
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
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch('')
  update(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.id, dto);
  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: string) {
    return this.userService.deleteUser(id);
  }

  @Post('test')
  async test() {
    await this.notificationsService.sendFirebaseMessages({
      title: 'Hoa Nguyen',
      message: '123123123123',
      token: 'd2oshj1mSAGguiq9gzD88A:APA91bGpOhW0IbMzs3xT8-L-bbWyXdo_we3J2QPRJp7fYGAkkng9sk0Ps16foosqkcuF1S9cJj4fEcAtAWP2u-IO54DjSP4bstxuzmB7_1ZeDQt-1OALG4HVyOFSRzhEP0IYqqPZLUgD'
    });
  }
}

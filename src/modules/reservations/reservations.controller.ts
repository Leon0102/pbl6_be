import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from '../../guards/roles.guard';
import { VnPayService } from '../../shared/vnpay.service';
import { GetUser } from '../auth/decorators';
import { CreateReservationDto } from './dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@ApiTags('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,

    private readonly vnPay: VnPayService
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiOperation({ summary: 'Get All Reservations' })
  @ApiOkResponse({
    description: 'Get All Reservations'
  })
  @ApiOperation({ summary: 'Get All Reservations' })
  async findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOperation({ summary: 'Get One Reservation' })
  @ApiOkResponse({
    description: 'Get One Reservation'
  })
  @ApiOperation({ summary: 'Get One Reservation' })
  async getOneReservation(@Param('id') id: string, @GetUser() user: User) {
    return this.reservationsService.getOneReservation(user, id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOperation({ summary: 'Create Reservation' })
  @ApiOkResponse({
    description: 'Create Reservation'
  })
  @ApiOperation({ summary: 'Create Reservation' })
  async create(@GetUser() user: User, @Body() dto: CreateReservationDto) {
    return this.reservationsService.createReservation(user.id, dto);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOperation({ summary: 'Cancel Reservation' })
  @ApiOkResponse({
    description: 'Cancel Reservation'
  })
  async cancelReservation(@GetUser() user: User, @Param('id') id: string) {
    return this.reservationsService.cancelReservation(user.id, id);
  }

  // @Patch(':id/confirm')
  // @HttpCode(HttpStatus.ACCEPTED)
  // @UseGuards(RoleGuard([RoleType.HOST]))
  // @ApiOkResponse({
  //     description: 'Confirm Reservation',
  // })
  // @ApiOperation({ summary: 'Confirm Reservation' })
  // async confirmReservation(
  //     @GetUser() user: User,
  //     @Param('id') id: string,
  // ) {
  //     return this.reservationsService.confirmReservation(user.id, id);
  // }

  @Post('create_payment_url')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.GUEST]))
  @ApiOkResponse({
    description: 'Get link to payment'
  })
  @ApiOperation({ summary: 'Get link to payment' })
  createPaymentUrl(@Body() dto: any) {
    console.log(dto);
    return this.vnPay.createPaymentUrl(dto);
  }

  @Get('vnpay_return')
  async vnpayReturn(@Req() req: any) {
    const result = this.vnPay.vnPayReturn(req);
    if (result.message === 'success') {
      await this.reservationsService.confirmReservation(req.query.vnp_TxnRef);
      return {
        message: 'Reservation confirmed'
      };
    }
  }

  @Get('vnpay_ipn')
  vnpayIpn(@Req() req: any) {
    return this.vnPay.vnPayIPN(req);
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from '../../guards/roles.guard';
import { GetUser } from '../auth/decorators';
import { CreateReservationDto } from './dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@ApiTags('reservations')
export class ReservationsController {
    constructor(
        private readonly reservationsService: ReservationsService,
    ) {}


    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RoleGuard([RoleType.ADMIN]))
    @ApiOperation({ summary: 'Get All Reservations' })
    @ApiOkResponse({
        description: 'Get All Reservations',
    })
    async findAll() {
        return this.reservationsService.findAll();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RoleGuard([RoleType.GUEST]))
    @ApiOperation({ summary: 'Create Reservation' })
    @ApiOkResponse({
        description: 'Create Reservation',
    })
    async create(
        @GetUser() user: User,
        @Body() dto: CreateReservationDto,
    ) {
        return this.reservationsService.createReservation(user.id, dto);
    }
}

import { GetUser } from '@modules/auth/decorators';
import { ReservationsService } from '@modules/reservations/reservations.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('hosts/reservations')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard([RoleType.HOST]))
  @ApiOkResponse({
    type: String,
    description: 'Find all reservations for host'
  })
  @ApiOperation({ summary: 'Find all reservations for host' })
  async getHostReservationsReport(
    @Query()
    query: {
      propertyId: string;
      dateRange: string;
    },
    @GetUser() user: User
  ) {
    return this.reportsService.getHostReservationsReport(query, user.id);
  }
}

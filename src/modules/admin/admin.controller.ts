import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import RoleGuard from '../../guards/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {

  constructor(
    private readonly adminService: AdminService,
  ) {

  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Analytics' })
  @Get('analytics')
  async getAnalytics() {
    const total = await this.adminService.getTotal();
    const usersEachMonth = await this.adminService.getUsersEachMonth();
    const propertiesEachCategory = await this.adminService.getPropertiesEachCategory();
    const amountReservationsEachMonth = await this.adminService.getAmountReservationsEachMonth();
    return {
      total,
      usersEachMonth,
      propertiesEachCategory,
      amountReservationsEachMonth,
    };
  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Notifications' })
  @Get('notifications')
  async getNotifications(@Query() options: PageOptionsDto) {
    return await this.adminService.getNotificationsFromAdmin(options);
  }
}

import { ReservationsModule } from '@modules/reservations/reservations.module';
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ReservationsModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}

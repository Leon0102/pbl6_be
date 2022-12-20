import { AuthModule } from '@modules/auth/auth.module';
import { PropertiesModule } from '@modules/properties/properties.module';
import { ReservationsModule } from '@modules/reservations/reservations.module';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ReservationsModule),
    PropertiesModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}

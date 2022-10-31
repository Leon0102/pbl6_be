import { Module } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import { RoomTypesController } from './room-types.controller';
import { RoomsModule } from '@modules/rooms/rooms.module';

@Module({
  providers: [RoomTypesService],
  controllers: [RoomTypesController],
  imports: [RoomsModule],
  exports: [RoomTypesService],
})
export class RoomTypesModule {}

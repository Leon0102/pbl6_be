import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { RoomTypesModule } from '@modules/room-types/room-types.module';

@Module({
  providers: [PropertiesService],
  controllers: [PropertiesController],
  imports: [RoomTypesModule],
})
export class PropertiesModule {}

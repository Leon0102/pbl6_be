import { ReviewsModule } from '@modules/reviews/reviews.module';
import { RoomTypesModule } from '@modules/room-types/room-types.module';
import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
@Module({
  imports: [RoomTypesModule, ReviewsModule],
  providers: [PropertiesService],
  controllers: [PropertiesController]
})
export class PropertiesModule {}

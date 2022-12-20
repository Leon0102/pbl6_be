import { PrismaModule } from '@modules/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RoomTypesModule } from './modules/room-types/room-types.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModule } from './shared/shared.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: configService.get('MAIL_SECURE'),
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS')
          }
        }
      }),
      inject: [ConfigService]
    }),
    ScheduleModule.forRoot(),
    SharedModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    RoomsModule,
    CategoriesModule,
    RoomTypesModule,
    PrismaModule,
    ReservationsModule,
    ReviewsModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

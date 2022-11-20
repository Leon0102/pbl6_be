import { HttpExceptionFilter } from '@common/exceptions/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { WrapResponseInterceptor } from './interceptor/wrap-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('/api');
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );
  app.enableVersioning();

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new WrapResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Wanderlust API')
    .setDescription('The Wanderlust API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT'), '0.0.0.0');
  console.info(
    `🚀 Server running on: http://localhost:${configService.get('PORT')}/api`
  );
}
bootstrap();

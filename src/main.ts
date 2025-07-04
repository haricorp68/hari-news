import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Thêm tiền tố /api cho tất cả các route
  app.setGlobalPrefix('api');

  // Cấu hình global interceptors, pipes, và filters
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Cấu hình CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL, // Set this to your frontend domain as needed
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

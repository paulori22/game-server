import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { isAllowedOrigin } from './common/allowed-origin';

export async function createNestApp(
  adapter?: ExpressAdapter,
): Promise<INestApplication> {
  const app = adapter
    ? await NestFactory.create(AppModule, adapter)
    : await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const isProd = configService.get<boolean>('cors.isProduction');
  const extraOrigins = configService.get<string[]>('cors.extraOrigins') ?? [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!isProd) {
        callback(null, true);
        return;
      }
      if (!origin) {
        callback(null, false);
        return;
      }
      callback(null, isAllowedOrigin(origin, extraOrigins, true));
    },
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-KEY'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  return app;
}

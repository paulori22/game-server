import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAllowedOrigin } from './common/allowed-origin';

export function configureNestApp(app: INestApplication): void {
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
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureNestApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureNestApp(app);
  const port = parseInt(
    process.env.PORT ?? process.env.APP_PORT ?? '3000',
    10,
  );
  await app.listen(port);
}
bootstrap();

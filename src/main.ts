import { createNestApp } from './bootstrap';

async function bootstrap() {
  const app = await createNestApp();
  const port = parseInt(process.env.APP_PORT ?? '3000', 10);
  await app.listen(port);
}
bootstrap();

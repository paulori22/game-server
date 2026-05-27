import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AuthModule } from '../src/auth/auth.module';
import { configureNestApp } from '../src/bootstrap';
import apiKeyConfig from '../src/config/apiKey.config';
import corsConfig from '../src/config/cors.config';
import { AuthMiddleware } from '../src/middleware/auth/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [apiKeyConfig, corsConfig],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
class TestAppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes({ path: '{*splat}', method: RequestMethod.ALL });
  }
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testApiKey = 'test-public-key';

  beforeEach(async () => {
    process.env.PUBLIC_API_KEYS = testApiKey;
    process.env.ADMIN_API_KEYS = '';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureNestApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('X-API-KEY', testApiKey)
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
    });
  });
});

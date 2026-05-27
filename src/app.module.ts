import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import apiKeyConfig from './config/apiKey.config';
import corsConfig from './config/cors.config';
import databaseConfig from './config/database.config';
import { TypeOrmConfigService } from './config/typeorm.config';
import { GamesModule } from './games/games.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AuthMiddleware } from './middleware/auth/auth.middleware';
import { OriginMiddleware } from './middleware/origin/origin.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [databaseConfig, apiKeyConfig, corsConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'leaderboardSubmit',
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    GamesModule,
    LeaderboardModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OriginMiddleware,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OriginMiddleware).forRoutes({
      path: 'games/:slug/leaderboard{*splat}',
      method: RequestMethod.ALL,
    });

    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes({ path: '{*splat}', method: RequestMethod.ALL });
  }
}

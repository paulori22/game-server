import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Game } from 'src/games/entities/game.entity';
import { LeaderboardEntry } from 'src/leaderboard/entities/leaderboard-entry.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const ssl = this.configService.get('database.ssl');
    return {
      type: 'postgres',
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      database: this.configService.get('database.database'),
      username: this.configService.get('database.username'),
      password: this.configService.get('database.password'),
      ssl: ssl ? { rejectUnauthorized: false } : false,
      entities: [Game, LeaderboardEntry],
      synchronize:
        this.configService.get('database.env') === 'development' ? true : false,
      logging:
        this.configService.get('database.env') === 'development' ? true : false,
    };
  }
}

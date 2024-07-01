import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Score } from 'src/scores/entities/score.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      database: this.configService.get('database.database'),
      username: this.configService.get('database.username'),
      password: this.configService.get('database.password'),
      entities: [Score],
      synchronize:
        this.configService.get('database.env') === 'development' ? true : false,
      logging:
        this.configService.get('database.env') === 'development' ? true : false,
    };
  }
}

//import 'dotenv/config';
import { Game } from 'src/games/entities/game.entity';
import { LeaderboardEntry } from 'src/leaderboard/entities/leaderboard-entry.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [Game, LeaderboardEntry],
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
  logging: process.env.NODE_ENV === 'development' ? true : false,
};

export default new DataSource(databaseConfig);

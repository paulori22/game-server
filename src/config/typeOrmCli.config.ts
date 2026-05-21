import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { Game } from '../games/entities/game.entity';
import { LeaderboardEntry } from '../leaderboard/entities/leaderboard-entry.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

if (process.env.DOTENV_CONFIG_PATH) {
  loadEnv({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  loadEnv();
}

const isCompiled = __filename.endsWith('.js');
const migrationsDir = join(__dirname, '..', 'migrations');

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [Game, LeaderboardEntry],
  migrations: [join(migrationsDir, isCompiled ? '*.js' : '*.ts')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

export default new DataSource(databaseConfig);

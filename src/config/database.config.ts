import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  env: process.env.NODE_ENV || 'development',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
}));

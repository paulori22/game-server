import { registerAs } from '@nestjs/config';

export default registerAs('apiKey', () => ({
  keys: process.env.AUTHORIZED_API_KEYS.split(','),
}));

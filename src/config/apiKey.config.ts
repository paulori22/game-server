import { registerAs } from '@nestjs/config';

export default registerAs('apiKey', () => ({
  keys: process.env.AUTORIZED_API_KEYS.split(','),
}));

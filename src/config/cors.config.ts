import { registerAs } from '@nestjs/config';

function parseCommaList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default registerAs('cors', () => ({
  isProduction: process.env.NODE_ENV === 'production',
  extraOrigins: parseCommaList(process.env.ALLOWED_ORIGINS),
}));

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

export default registerAs('apiKey', () => {
  const publicKeys = parseCommaList(process.env.PUBLIC_API_KEYS);
  const adminKeys = parseCommaList(process.env.ADMIN_API_KEYS);
  const keys = [...new Set([...publicKeys, ...adminKeys])];

  return {
    keys,
    publicKeys,
    adminKeys,
  };
});

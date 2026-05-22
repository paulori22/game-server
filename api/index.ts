import { ExpressAdapter } from '@nestjs/platform-express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createNestApp } from '../src/bootstrap';

let cachedServer: express.Express;

async function getServer(): Promise<express.Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const app = await createNestApp(new ExpressAdapter(expressApp));
  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const server = await getServer();
  server(req, res);
}

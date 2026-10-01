import type { Request, Response } from 'express';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

let appInstance: ReturnType<typeof createApp> | null = null;

export default async function handler(req: Request, res: Response) {
  // Ensure database is connected across serverless function invocations
  await connectDatabase();

  if (!appInstance) {
    appInstance = createApp();
  }

  return appInstance(req, res);
}

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const clients = new Map<string, ClientRecord>();

  // Periodically clean expired records
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clients.entries()) {
      if (now > record.resetAt) {
        clients.delete(key);
      }
    }
  }, 60000).unref();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = clients.get(ip);
    if (!record || now > record.resetAt) {
      clients.set(ip, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      return next();
    }

    if (record.count >= options.max) {
      throw new AppError(
        options.message || 'Too many requests, please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    record.count++;
    next();
  };
}

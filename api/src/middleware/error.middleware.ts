import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { ValidationError } from '../shared/errors/ValidationError.js';
import { logger } from '../shared/utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let code = 'INTERNAL_SERVER_ERROR';
  let details: unknown = undefined;

  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'VALIDATION_ERROR';
    details = err.errors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APPLICATION_ERROR';
  } else if (err instanceof Error) {
    // Mongoose or Mongo duplicate key error
    if ('code' in err && (err as { code: number }).code === 11000) {
      statusCode = 409;
      message = 'A duplicate resource conflict occurred';
      code = 'DUPLICATE_KEY_ERROR';
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid resource identifier format';
      code = 'INVALID_ID';
    } else {
      message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;
    }
  }

  logger.error('HTTP Request Error', {
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode,
    errorCode: code,
    errorMessage: message,
    stack: env.NODE_ENV !== 'production' && err instanceof Error ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
    },
  });
}

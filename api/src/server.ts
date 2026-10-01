import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { changeRepository } from './modules/change/change.repository.js';
import { logger } from './shared/utils/logger.js';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  try {
    await connectDatabase();
    changeRepository.cleanupExpired().then((deleted) => {
      if (deleted > 0) {
        logger.info(`Purged ${deleted} expired activity logs according to retention policy`);
      }
    }).catch(() => {});
  } catch (error) {
    logger.error('Database connection failed on startup', {
      error: error instanceof Error ? error.message : 'Unknown DB error',
    });
  }

  server.listen(env.PORT, () => {
    logger.info(`EnvGuard API listening on port ${env.PORT}`, {
      port: env.PORT,
      env: env.NODE_ENV,
      health: `http://localhost:${env.PORT}/health`,
    });
  });

  // Graceful shutdown handling (Section 58)
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await disconnectDatabase();
      } catch (err) {
        logger.error('Error disconnecting database during shutdown', { error: err });
      }
      process.exit(0);
    });

    // Force shutdown if taking more than 10 seconds
    setTimeout(() => {
      logger.error('Forceful shutdown timeout reached');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});

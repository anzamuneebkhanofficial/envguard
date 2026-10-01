import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { isDatabaseConnected } from './config/database.js';
import { errorHandler } from './middleware/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { projectRoutes } from './modules/project/project.routes.js';
import { variableRoutes } from './modules/variable/variable.routes.js';
import { variableController } from './modules/variable/variable.controller.js';
import { changeRoutes } from './modules/change/change.routes.js';
import { alertRoutes } from './modules/alert/alert.routes.js';
import { authenticate } from './middleware/auth.middleware.js';
import { asyncHandler } from './shared/utils/asyncHandler.js';
import { NotFoundError } from './shared/errors/NotFoundError.js';

export function createApp() {
  const app = express();

  // Basic security and parsing middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Public Health check endpoint (Section 57 & 63)
  app.get('/health', (_req, res) => {
    const dbStatus = isDatabaseConnected();
    res.status(dbStatus ? 200 : 503).json({
      status: dbStatus ? 'healthy' : 'degraded',
      service: 'EnvGuard API',
      database: dbStatus ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Direct env-example endpoint per Section 22
  app.get(
    '/api/projects/:projectId/env-example',
    authenticate,
    asyncHandler(variableController.getEnvExample)
  );

  // Mount API domain routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/projects/:projectId/variables', variableRoutes);
  app.use('/api/projects/:projectId/changes', changeRoutes);
  app.use('/api/alerts', alertRoutes);

  // Catch-all 404 handler
  app.use((req, _res, next) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // Global Error Handler registered LAST (Section 15)
  app.use(errorHandler);

  return app;
}

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts, please try again after 15 minutes',
});

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.me)
);

export const authRoutes = router;

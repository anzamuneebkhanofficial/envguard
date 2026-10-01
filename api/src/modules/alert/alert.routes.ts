import { Router } from 'express';
import { alertController } from './alert.controller.js';
import {
  updateAlertPreferenceSchema,
  testWebhookSchema,
  alertProjectParamSchema,
} from './alert.schema.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get(
  '/:projectId',
  validateParams(alertProjectParamSchema),
  asyncHandler(alertController.getPreference)
);

router.put(
  '/:projectId',
  validateParams(alertProjectParamSchema),
  validateBody(updateAlertPreferenceSchema),
  asyncHandler(alertController.updatePreference)
);

router.post(
  '/test-webhook',
  validateBody(testWebhookSchema),
  asyncHandler(alertController.testWebhook)
);

export const alertRoutes = router;

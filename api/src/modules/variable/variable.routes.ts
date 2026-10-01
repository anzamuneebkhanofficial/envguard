import { Router } from 'express';
import { variableController } from './variable.controller.js';
import {
  syncVariablesSchema,
  updateVariableSchema,
  variableKeyParamSchema,
  projectParamSchema,
} from './variable.schema.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  validateParams(projectParamSchema),
  asyncHandler(variableController.list)
);

router.post(
  '/sync',
  validateParams(projectParamSchema),
  validateBody(syncVariablesSchema),
  asyncHandler(variableController.sync)
);

router.get(
  '/export/env',
  validateParams(projectParamSchema),
  asyncHandler(variableController.exportEnv)
);

router.get(
  '/export/example',
  validateParams(projectParamSchema),
  asyncHandler(variableController.exportExample)
);

router.patch(
  '/:key',
  validateParams(variableKeyParamSchema),
  validateBody(updateVariableSchema),
  asyncHandler(variableController.update)
);

router.delete(
  '/:key',
  validateParams(variableKeyParamSchema),
  asyncHandler(variableController.delete)
);

export const variableRoutes = router;

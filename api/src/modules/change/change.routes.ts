import { Router } from 'express';
import { changeController } from './change.controller.js';
import { listChangesQuerySchema, changeParamsSchema } from './change.schema.js';
import { validateQuery, validateParams } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  validateParams(changeParamsSchema),
  validateQuery(listChangesQuerySchema),
  asyncHandler(changeController.list)
);

router.get(
  '/:changeId',
  validateParams(changeParamsSchema),
  asyncHandler(changeController.getById)
);

export const changeRoutes = router;

import { Router } from 'express';
import { projectController } from './project.controller.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  projectIdParamSchema,
  memberParamSchema,
} from './project.schema.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(projectController.list)
);

router.post(
  '/',
  validateBody(createProjectSchema),
  asyncHandler(projectController.create)
);

router.get(
  '/:id',
  validateParams(projectIdParamSchema),
  asyncHandler(projectController.getById)
);

router.patch(
  '/:id',
  validateParams(projectIdParamSchema),
  validateBody(updateProjectSchema),
  asyncHandler(projectController.update)
);

router.delete(
  '/:id',
  validateParams(projectIdParamSchema),
  asyncHandler(projectController.delete)
);

router.post(
  '/:id/members',
  validateParams(projectIdParamSchema),
  validateBody(addMemberSchema),
  asyncHandler(projectController.addMember)
);

router.delete(
  '/:id/members/:userId',
  validateParams(memberParamSchema),
  asyncHandler(projectController.removeMember)
);

export const projectRoutes = router;

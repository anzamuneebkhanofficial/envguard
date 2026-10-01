import { z } from 'zod';
import { CHANGE_ACTIONS } from '../../config/constants.js';

export const listChangesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  key: z.string().optional(),
  action: z.enum(CHANGE_ACTIONS).optional(),
  from: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  to: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

export const changeParamsSchema = z.object({
  projectId: z.string().min(1),
  changeId: z.string().optional(),
});

export type ListChangesQueryInput = z.infer<typeof listChangesQuerySchema>;

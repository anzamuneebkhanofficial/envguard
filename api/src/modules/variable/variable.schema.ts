import { z } from 'zod';

export const syncVariablesSchema = z.object({
  variables: z.array(
    z.object({
      key: z
        .string()
        .min(1, 'Key is required')
        .regex(/^[A-Za-z0-9_]+$/, 'Variable key must be alphanumeric with underscores'),
      value: z.string().default(''),
    })
  ),
  source: z.enum(['cli', 'dashboard']).default('cli'),
});

export const updateVariableSchema = z.object({
  value: z.string().optional(),
  isCritical: z.boolean().optional(),
});

export const variableKeyParamSchema = z.object({
  projectId: z.string().min(1),
  key: z.string().min(1),
});

export const projectParamSchema = z.object({
  projectId: z.string().min(1),
});

export type SyncVariablesInput = z.infer<typeof syncVariablesSchema>;
export type UpdateVariableInput = z.infer<typeof updateVariableSchema>;

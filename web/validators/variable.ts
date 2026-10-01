import { z } from 'zod';

export const variableFormSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .regex(/^[A-Za-z0-9_]+$/, 'Key must only contain letters, numbers, and underscores'),
  value: z.string().default(''),
  isCritical: z.boolean().default(false),
});

export const syncPasteFormSchema = z.object({
  envContent: z.string().min(1, 'Please paste at least one environment variable'),
});

export type VariableFormValues = z.infer<typeof variableFormSchema>;
export type SyncPasteFormValues = z.infer<typeof syncPasteFormSchema>;

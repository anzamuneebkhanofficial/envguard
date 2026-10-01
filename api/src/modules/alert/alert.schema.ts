import { z } from 'zod';

export const updateAlertPreferenceSchema = z.object({
  notifyOnCriticalChange: z.boolean().default(true),
  webhookUrl: z
    .string()
    .url('Must be a valid URL starting with http:// or https://')
    .optional()
    .or(z.literal('')),
  emailNotifications: z.boolean().default(false),
});

export const testWebhookSchema = z.object({
  webhookUrl: z.string().url('Must be a valid URL starting with http:// or https://'),
  projectId: z.string().optional(),
});

export const alertProjectParamSchema = z.object({
  projectId: z.string().min(1),
});

export type UpdateAlertPreferenceInput = z.infer<typeof updateAlertPreferenceSchema>;
export type TestWebhookInput = z.infer<typeof testWebhookSchema>;

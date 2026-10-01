import { z } from 'zod';

export const projectFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(50, 'Max 50 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'Project name may only contain alphanumeric characters, hyphens, and underscores'),
  description: z.string().max(300, 'Max 300 characters').default(''),
});

export const addMemberFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['owner', 'editor', 'viewer']),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type AddMemberFormValues = z.infer<typeof addMemberFormSchema>;

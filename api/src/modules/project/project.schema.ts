import { z } from 'zod';
import { USER_ROLES } from '../../config/constants.js';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(50).trim(),
  description: z.string().max(300).default('').transform((val) => val.trim()),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  description: z.string().max(300).trim().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  role: z.enum(USER_ROLES),
});

export const projectIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export const memberParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;

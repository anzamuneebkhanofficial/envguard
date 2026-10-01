import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://localhost:27017/envguard'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('development-jwt-secret-not-for-prod-use-64ch'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('EnvGuard <noreply@envguard.local>'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  PROJECTS_PAGE_LIMIT: z.coerce.number().default(6),
  VARIABLES_PAGE_LIMIT: z.coerce.number().default(10),
  HISTORY_PAGE_LIMIT: z.coerce.number().default(8),
  MEMBERS_PAGE_LIMIT: z.coerce.number().default(5),
  ACTIVITY_RETENTION_DAYS: z.coerce.number().default(7),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration. Aborting startup.');
}

export const env = parsedEnv.data;

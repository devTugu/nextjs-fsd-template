import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .refine((url) => url.endsWith('/api/v1'), {
      message: 'API base URL must end with /api/v1',
    }),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Admin Console'),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Admin Console',
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success && process.env.NODE_ENV === 'production') {
  console.error('Invalid environment variables:', parsed.error.flatten());
}

export const env = {
  API_BASE_URL: parsed.success
    ? parsed.data.NEXT_PUBLIC_API_BASE_URL
    : 'http://localhost:3001/api/v1',
  APP_NAME: parsed.success ? parsed.data.NEXT_PUBLIC_APP_NAME : 'Admin Console',
  APP_ENV: process.env.NODE_ENV ?? 'development',
} as const;

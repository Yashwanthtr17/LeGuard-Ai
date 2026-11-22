import { z } from 'zod';

const DEV_JWT_SECRET = 'leguard-development-only-secret-change-me-32';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must not be empty').optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  NEXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
  UPLOAD_DIR: z.string().min(1).optional(),
  METRICS_TOKEN: z.string().min(1).optional(),
  AI_PROVIDER: z
    .enum(['openrouter', 'gemini', 'openai', 'claude', 'ollama'])
    .optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

function readEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = readEnv();
  }
  return cachedEnv;
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

export function getDatabaseUrl(): string {
  const url = getEnv().DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and configure PostgreSQL.'
    );
  }
  return url;
}

export function getJwtSecret(): string {
  const env = getEnv();

  if (env.JWT_SECRET) {
    return env.JWT_SECRET;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production and must be at least 32 characters.');
  }

  if (env.NODE_ENV === 'development') {
    console.warn(
      '[env] JWT_SECRET is not set; using an insecure development-only value. Configure it in .env.local.'
    );
  }

  return DEV_JWT_SECRET;
}

export function getSiteUrl(): string {
  return getEnv().NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function getUploadDir(): string {
  return getEnv().UPLOAD_DIR || '.uploads';
}

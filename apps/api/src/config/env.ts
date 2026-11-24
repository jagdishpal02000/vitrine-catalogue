import { z } from 'zod';

/** A comma-separated variable, e.g. "a, b,c" becomes ["a", "b", "c"]. */
const commaSeparated = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  // How many reverse proxies sit in front of the API (nginx in Docker), so rate limits see the real client IP.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  CORS_ORIGINS: commaSeparated('http://localhost:5173,http://localhost:8080'),
  FAKE_STORE_BASE_URL: z.url().default('https://fakestoreapi.com'),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Fail fast: running with half-valid configuration causes confusing errors later.
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Typed, validated configuration. The only place the app reads environment variables. */
export const config = loadConfig();

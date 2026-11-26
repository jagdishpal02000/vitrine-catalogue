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
  // The business owner's "top rated" picks, in display order. Defaults to the 5 best-rated Fake Store products.
  TOP_RATED_PRODUCT_IDS: commaSeparated('12,11,3,18,5'),
  // Email goes over SMTP: Mailpit locally (port 1025, no auth), any SMTP provider such as AWS SES in production.
  SMTP_HOST: z.string().min(1).default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.email().default('vitrine@example.com'),
  SALES_INBOX_EMAIL: z.email().default('sales@example.com'),
  // Used for the product link in the enquiry email.
  WEB_BASE_URL: z.url().default('http://localhost:8080'),
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

/** Largest JSON request body we accept. An enquiry is well under 1 kB. */
export const JSON_BODY_LIMIT = '10kb';

/** How long product data from the upstream source is reused before being fetched again. */
export const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000;

/** How long we wait for an upstream service before giving up. */
export const UPSTREAM_TIMEOUT_MS = 5000;

/** Top-rated products shown on a category page when the owner picked none in that category. */
export const CATEGORY_TOP_RATED_FALLBACK_COUNT = 3;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/** Requests allowed per client IP in each time window. */
export const RATE_LIMITS = {
  api: { windowMs: FIFTEEN_MINUTES_MS, limit: 300 },
} as const;

/** Machine-readable codes used in every error response. */
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  UPSTREAM_UNAVAILABLE: 'UPSTREAM_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Largest JSON request body we accept. An enquiry is well under 1 kB. */
export const JSON_BODY_LIMIT = '10kb';

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
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

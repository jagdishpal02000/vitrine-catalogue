/** Largest JSON request body we accept. An enquiry is well under 1 kB. */
export const JSON_BODY_LIMIT = '10kb';

/** Machine-readable codes used in every error response. */
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

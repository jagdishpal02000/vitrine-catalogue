/** Largest JSON request body we accept. An enquiry is well under 1 kB. */
export const JSON_BODY_LIMIT = '10kb';

/** How long product data from the upstream source is reused before being fetched again. */
export const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000;

/** How long we wait for an upstream service before giving up. */
export const UPSTREAM_TIMEOUT_MS = 5000;

/** Top-rated products shown on a category page when the owner picked none in that category. */
export const CATEGORY_TOP_RATED_FALLBACK_COUNT = 3;

/** Longest value we accept for each input field. */
export const FIELD_LIMITS = {
  id: 64,
  searchQuery: 100,
  name: 100,
  email: 254,
  phone: 30,
  message: 2000,
} as const;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/** Requests allowed per client IP in each time window. */
export const RATE_LIMITS = {
  api: { windowMs: FIFTEEN_MINUTES_MS, limit: 300 },
  enquiries: { windowMs: FIFTEEN_MINUTES_MS, limit: 5 },
} as const;

// Everything a client can receive (status codes, error codes, messages) is defined below,
// so the API's responses can be reviewed and changed in one place.

/** The HTTP status codes the API sends, named so code reads as intent rather than numbers. */
export const HTTP_STATUS = {
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;

/** Machine-readable codes used in every error response. Clients rely on these, not on messages. */
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  UPSTREAM_UNAVAILABLE: 'UPSTREAM_UNAVAILABLE',
  EMAIL_FAILED: 'EMAIL_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** One kind of error: the status it is sent with, its stable code and a message for developers. */
export interface ErrorDefinition {
  status: number;
  code: ErrorCode;
  message: string;
}

/** Every error the API can return, each defined once. Throw them with `new AppError(ERRORS.X)`. */
export const ERRORS = {
  BAD_REQUEST: {
    status: HTTP_STATUS.BAD_REQUEST,
    code: ERROR_CODES.BAD_REQUEST,
    message: 'The request could not be read',
  },
  VALIDATION_ERROR: {
    status: HTTP_STATUS.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Some of the details you sent are not valid',
  },
  ROUTE_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: ERROR_CODES.NOT_FOUND,
    message: 'The requested resource was not found',
  },
  PRODUCT_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: ERROR_CODES.NOT_FOUND,
    message: 'Product not found',
  },
  CATEGORY_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: ERROR_CODES.NOT_FOUND,
    message: 'Category not found',
  },
  RATE_LIMITED: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    code: ERROR_CODES.RATE_LIMITED,
    message: 'Too many requests. Please try again later.',
  },
  UPSTREAM_UNAVAILABLE: {
    status: HTTP_STATUS.BAD_GATEWAY,
    code: ERROR_CODES.UPSTREAM_UNAVAILABLE,
    message: 'A service we rely on is unavailable. Please try again shortly.',
  },
  EMAIL_FAILED: {
    status: HTTP_STATUS.BAD_GATEWAY,
    code: ERROR_CODES.EMAIL_FAILED,
    message: 'We could not send your enquiry. Please try again.',
  },
  INTERNAL_ERROR: {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'Something went wrong. Please try again.',
  },
} as const satisfies Record<string, ErrorDefinition>;

/** Field messages returned in a validation error's details. */
export const VALIDATION_MESSAGES = {
  SEARCH_TERM_REQUIRED: 'Enter a search term',
  NAME_REQUIRED: 'Enter your name',
  EMAIL_INVALID: 'Enter a valid email address',
  PHONE_INVALID: 'Enter a valid phone number',
} as const;

/** Messages in successful responses. */
export const SUCCESS_MESSAGES = {
  ENQUIRY_SENT: 'Thank you. Your enquiry has been sent to our sales team.',
} as const;

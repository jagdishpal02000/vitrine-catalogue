// What customers see when something goes wrong. The web app owns this text: it never shows the API's
// own wording, routes, codes or stack traces. Keys are the API's stable error codes (see /api/v1/docs),
// plus NETWORK_ERROR for when the server cannot be reached at all.
const USER_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "We couldn't reach our servers. Please check your connection and try again.",
  VALIDATION_ERROR:
    "Some of the details you entered don't look right. Please check them and try again.",
  NOT_FOUND: "Sorry, we couldn't find what you were looking for.",
  RATE_LIMITED:
    "You've made a lot of requests in a short time. Please wait a few minutes and try again.",
  UPSTREAM_UNAVAILABLE: "We can't load our products right now. Please try again in a moment.",
  EMAIL_FAILED: "We couldn't send your enquiry just now. Please try again in a moment.",
};

// For everything else: server errors, codes added later, and anything unexpected.
const GENERIC_MESSAGE = 'Something went wrong on our side. Please try again in a moment.';

/** A failed API call. Its message is always one of the friendly messages above. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(USER_MESSAGES[code] ?? GENERIC_MESSAGE);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** The text to show a customer for any error: an API error's friendly message, or the generic one. */
export function getUserMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_MESSAGE;
}

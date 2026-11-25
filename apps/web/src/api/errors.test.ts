import { describe, expect, it } from 'vitest';
import { ApiError, getUserMessage } from './errors';

const GENERIC = 'Something went wrong on our side. Please try again in a moment.';

describe('ApiError', () => {
  it.each([
    ['NETWORK_ERROR', "We couldn't reach our servers. Please check your connection and try again."],
    [
      'VALIDATION_ERROR',
      "Some of the details you entered don't look right. Please check them and try again.",
    ],
    ['NOT_FOUND', "Sorry, we couldn't find what you were looking for."],
    [
      'RATE_LIMITED',
      "You've made a lot of requests in a short time. Please wait a few minutes and try again.",
    ],
    ['UPSTREAM_UNAVAILABLE', "We can't load our products right now. Please try again in a moment."],
    ['EMAIL_FAILED', "We couldn't send your enquiry just now. Please try again in a moment."],
  ])('shows friendly text for %s', (code, message) => {
    expect(new ApiError(400, code).message).toBe(message);
  });

  it('falls back to a generic friendly message for any other code', () => {
    for (const code of ['INTERNAL_ERROR', 'BAD_REQUEST', 'A_CODE_ADDED_LATER']) {
      expect(new ApiError(500, code).message).toBe(GENERIC);
    }
  });
});

describe('getUserMessage', () => {
  it("uses an API error's friendly text", () => {
    expect(getUserMessage(new ApiError(404, 'NOT_FOUND'))).toBe(
      "Sorry, we couldn't find what you were looking for.",
    );
  });

  it('never shows the text of an unexpected error', () => {
    const crash = new TypeError("Cannot read properties of undefined (reading 'slug')");

    expect(getUserMessage(crash)).toBe(GENERIC);
  });
});

import type { ErrorCode } from '../constants/index.js';

/**
 * An expected failure with an HTTP status, such as "product not found" (404).
 * Throw it from anywhere; the global error handler turns it into a JSON response.
 */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** A readable message from anything that was thrown. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

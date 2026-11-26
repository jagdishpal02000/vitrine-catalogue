import type { ErrorCode, ErrorDefinition } from '../constants/index.js';

/**
 * An expected failure, such as "product not found". Throw it with one of the definitions in
 * constants (`new AppError(ERRORS.PRODUCT_NOT_FOUND)`); the global error handler turns it into
 * a JSON response with the definition's status, code and message.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor({ status, code, message }: ErrorDefinition, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = status;
    this.code = code;
    this.details = details;
  }
}

/** A readable message from anything that was thrown. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

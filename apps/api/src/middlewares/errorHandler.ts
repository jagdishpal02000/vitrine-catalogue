import type { ErrorRequestHandler, Request } from 'express';
import { ERROR_CODES } from '../constants/index.js';
import { logger } from '../infra/logger.js';
import { AppError, getErrorMessage } from '../utils/errors.js';

/**
 * The single place that turns errors into HTTP responses.
 * Every error response has the same shape: { error: { code, message, details? } }.
 */
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  // Too late to send our JSON; let Express close the connection.
  if (res.headersSent) {
    next(error);
    return;
  }

  const appError = toAppError(error, req);
  res.status(appError.statusCode).json({
    error: { code: appError.code, message: appError.message, details: appError.details },
  });
};

function toAppError(error: unknown, req: Request): AppError {
  if (error instanceof AppError) return error;

  if (isBodyParserError(error)) {
    return new AppError(
      error.status,
      ERROR_CODES.BAD_REQUEST,
      'The request body could not be read',
    );
  }

  // Unexpected: log the details for us, return a generic message to the client.
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${getErrorMessage(error)}`, {
    stack: error instanceof Error ? error.stack : undefined,
  });
  return new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Something went wrong. Please try again.');
}

/** express.json() rejects malformed JSON (400) and oversized bodies (413) with an error carrying a 4xx status. */
function isBodyParserError(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 400 &&
    error.status < 500
  );
}

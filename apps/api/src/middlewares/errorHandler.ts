import type { ErrorRequestHandler, Request } from 'express';
import { ERRORS, HTTP_STATUS } from '../constants/index.js';
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

  if (isClientError(error)) {
    // Keep Express's own status (400, or 413 for a body that is too large).
    return new AppError({ ...ERRORS.BAD_REQUEST, status: error.status });
  }

  // Unexpected: log the details for us, return a generic message to the client.
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${getErrorMessage(error)}`, {
    stack: error instanceof Error ? error.stack : undefined,
  });
  return new AppError(ERRORS.INTERNAL_ERROR);
}

/**
 * Errors Express raises before our code runs carry a 4xx status: malformed JSON (400),
 * an oversized body (413) or a URL it cannot decode (400).
 */
function isClientError(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= HTTP_STATUS.BAD_REQUEST &&
    error.status < HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

import type { RequestHandler } from 'express';
import { ERROR_CODES } from '../constants/index.js';
import { AppError } from '../utils/errors.js';

/** Runs when no route matched. Throwing lets the global error handler send the response. */
export const notFoundHandler: RequestHandler = (req) => {
  throw new AppError(404, ERROR_CODES.NOT_FOUND, `Route not found: ${req.method} ${req.path}`);
};

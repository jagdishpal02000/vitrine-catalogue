import type { RequestHandler } from 'express';
import { ERRORS } from '../constants/index.js';
import { AppError } from '../utils/errors.js';

/**
 * Runs when no route matched. The response never echoes the request back (the request log already
 * records the path); throwing lets the global error handler send it.
 */
export const notFoundHandler: RequestHandler = () => {
  throw new AppError(ERRORS.ROUTE_NOT_FOUND);
};

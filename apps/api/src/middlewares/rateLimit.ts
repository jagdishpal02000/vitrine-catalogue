import { rateLimit } from 'express-rate-limit';
import { ERROR_CODES } from '../constants/index.js';
import { AppError } from '../utils/errors.js';

/**
 * Limits how many requests one client IP can make per time window.
 * Each call keeps its own counters in memory. With several API instances, switch to a shared store (e.g. Redis).
 */
export function createRateLimiter({ windowMs, limit }: { windowMs: number; limit: number }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    // Hand over to the global error handler so a 429 has the same JSON shape as every other error.
    handler: (_req, _res, next) => {
      next(
        new AppError(429, ERROR_CODES.RATE_LIMITED, 'Too many requests. Please try again later.'),
      );
    },
  });
}

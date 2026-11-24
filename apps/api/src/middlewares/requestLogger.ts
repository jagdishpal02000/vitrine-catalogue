import type { RequestHandler } from 'express';
import { logger } from '../infra/logger.js';

/** Logs one line per request: method, path, status and duration. Never the body or query, which can hold personal data. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const { method, path } = req;
  const startedAt = performance.now();

  res.on('finish', () => {
    const durationMs = Math.round(performance.now() - startedAt);
    logger.info(`${method} ${path} ${res.statusCode} ${durationMs}ms`);
  });

  next();
};

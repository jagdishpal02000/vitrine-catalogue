import type { z } from 'zod';
import { ERRORS, UPSTREAM_TIMEOUT_MS } from '../constants/index.js';
import { AppError, getErrorMessage } from '../utils/errors.js';
import { logger } from './logger.js';

/**
 * GETs JSON from another service and validates it with a zod schema.
 * Any failure (network, timeout, HTTP error or unexpected data) is logged and becomes a 502,
 * so upstream details never leak to our clients.
 */
export async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return schema.parse(await response.json());
  } catch (error) {
    logger.error(`Upstream request to ${url} failed: ${getErrorMessage(error)}`);
    throw new AppError(ERRORS.UPSTREAM_UNAVAILABLE);
  }
}

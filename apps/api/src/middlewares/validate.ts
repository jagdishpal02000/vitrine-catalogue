import type { Request, RequestHandler } from 'express';
import type { z } from 'zod';
import { ERRORS } from '../constants/index.js';
import { AppError } from '../utils/errors.js';

interface RequestSchemas {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}

/**
 * Router-level validation. Parses params, query and body with zod and swaps in the parsed values
 * (trimmed and typed), or rejects the request with a 400 that lists every invalid field.
 */
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    if (schemas.params) req.params = parse(schemas.params, req.params) as Request['params'];
    if (schemas.body) req.body = parse(schemas.body, req.body);
    if (schemas.query) {
      // Express 5 made req.query a read-only getter, so we define our own property with the parsed value.
      Object.defineProperty(req, 'query', { value: parse(schemas.query, req.query) });
    }
    next();
  };
}

function parse(schema: z.ZodType, data: unknown): unknown {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new AppError(ERRORS.VALIDATION_ERROR, details);
  }
  return result.data;
}

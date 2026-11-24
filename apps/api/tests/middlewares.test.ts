import express, { type RequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '../src/middlewares/errorHandler.js';
import { createRateLimiter } from '../src/middlewares/rateLimit.js';
import { validate } from '../src/middlewares/validate.js';

/** A tiny app with one route that echoes what it received, so each middleware is tested on its own. */
function createEchoApp(...middlewares: RequestHandler[]) {
  const app = express();
  app.use(express.json());
  app.post('/echo', ...middlewares, (req, res) => {
    res.json({ query: req.query, body: req.body as unknown });
  });
  app.use(errorHandler);
  return app;
}

describe('validate', () => {
  const app = createEchoApp(
    validate({
      query: z.object({ q: z.string().trim().min(1) }),
      body: z.strictObject({ name: z.string().trim().min(1), age: z.number().int() }),
    }),
  );

  it('passes the parsed, trimmed values on to the handler', async () => {
    const response = await request(app)
      .post('/echo?q=%20shoes%20')
      .send({ name: ' Ada ', age: 36 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ query: { q: 'shoes' }, body: { name: 'Ada', age: 36 } });
  });

  it('rejects invalid input with a 400 listing every invalid field', async () => {
    const response = await request(app).post('/echo?q=').send({ name: '', age: 'old' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        details: [
          { field: 'name', message: expect.any(String) as string },
          { field: 'age', message: expect.any(String) as string },
        ],
      },
    });
  });

  it('rejects fields the schema does not know about', async () => {
    const response = await request(app)
      .post('/echo?q=shoes')
      .send({ name: 'Ada', age: 36, admin: true });

    expect(response.status).toBe(400);
  });
});

describe('createRateLimiter', () => {
  it('returns a 429 in the standard error shape once the limit is reached', async () => {
    const app = createEchoApp(createRateLimiter({ windowMs: 60_000, limit: 2 }));

    await request(app).post('/echo').expect(200);
    await request(app).post('/echo').expect(200);
    const response = await request(app).post('/echo');

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
    });
    expect(response.headers['ratelimit-policy']).toBeDefined();
  });
});

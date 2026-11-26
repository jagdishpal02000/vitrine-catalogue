import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../../src/middlewares/rateLimit.js';
import { createEchoApp } from '../helpers.js';

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

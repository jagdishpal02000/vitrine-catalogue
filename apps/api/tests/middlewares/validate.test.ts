import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validate } from '../../src/middlewares/validate.js';
import { createEchoApp } from '../helpers.js';

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

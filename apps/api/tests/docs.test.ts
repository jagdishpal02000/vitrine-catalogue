import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp } from './helpers.js';

describe('API docs', () => {
  const app = createTestApp();

  it('serves an OpenAPI document that covers every endpoint', async () => {
    const response = await request(app).get('/api/v1/docs.json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: '3.0.3',
      info: { title: 'Vitrine API', version: '1.0.0' },
      servers: [{ url: '/api/v1' }],
    });
    for (const path of [
      '/top-rated',
      '/search',
      '/products/{id}',
      '/categories',
      '/categories/{slug}/products',
      '/enquiries',
    ]) {
      expect(response.body).toHaveProperty(['paths', path]);
    }
  });

  it('serves the Swagger UI', async () => {
    const response = await request(app).get('/api/v1/docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});

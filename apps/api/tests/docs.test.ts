import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp } from './helpers.js';

describe('API docs', () => {
  const app = createTestApp();

  it('serves an OpenAPI document that covers every endpoint', async () => {
    const response = await request(app).get('/api/docs.json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ openapi: '3.0.3', info: { title: 'Vitrine API' } });
    for (const path of [
      '/health',
      '/products/top-rated',
      '/products/search',
      '/products/{id}',
      '/categories',
      '/categories/{slug}/products',
      '/enquiries',
    ]) {
      expect(response.body).toHaveProperty(['paths', path]);
    }
  });

  it('serves the Swagger UI', async () => {
    const response = await request(app).get('/api/docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});

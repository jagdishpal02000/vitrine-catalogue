import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp } from './helpers.js';

describe('app', () => {
  const app = createTestApp();

  it('reports health at an unversioned path', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('serves the public API only under a version', async () => {
    expect((await request(app).get('/api/v1/top-rated')).status).toBe(200);
    expect((await request(app).get('/api/top-rated')).status).toBe(404);
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found: GET /api/unknown' },
    });
  });

  it('rejects a malformed JSON body with a 400', async () => {
    const response = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"broken"');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'BAD_REQUEST' } });
  });

  it('rejects a URL that cannot be decoded with a 400, not a 500', async () => {
    const response = await request(app).get('/api/v1/products/%E0');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: 'BAD_REQUEST', message: 'The request could not be read' },
    });
  });

  it('sends security headers and hides the framework', async () => {
    const response = await request(app).get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});

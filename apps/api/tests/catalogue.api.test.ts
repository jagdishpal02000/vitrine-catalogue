import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { AppError } from '../src/utils/errors.js';
import { mensJacket, mensTShirt, silverBracelet, womensRainJacket } from './fixtures.js';
import { createTestApp } from './helpers.js';

describe('GET /api/products/top-rated', () => {
  it("returns the owner's picks in order", async () => {
    const app = createTestApp({ topRatedIds: ['5', '1'] });

    const response = await request(app).get('/api/products/top-rated');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([silverBracelet, mensJacket]);
  });

  it('returns a 502 when the product source is down', async () => {
    const app = createTestApp({
      loadProducts: () =>
        Promise.reject(new AppError(502, 'UPSTREAM_UNAVAILABLE', 'Service unavailable')),
    });

    const response = await request(app).get('/api/products/top-rated');

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({ error: { code: 'UPSTREAM_UNAVAILABLE' } });
  });
});

describe('GET /api/products/search', () => {
  const app = createTestApp();

  it('returns only the products that match the term', async () => {
    const response = await request(app).get('/api/products/search').query({ q: 'jacket' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([mensJacket, womensRainJacket]);
  });

  it('rejects an empty term with a 400', async () => {
    const response = await request(app).get('/api/products/search').query({ q: '  ' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        details: [{ field: 'q', message: 'Enter a search term' }],
      },
    });
  });

  it('rejects a term longer than 100 characters', async () => {
    const response = await request(app)
      .get('/api/products/search')
      .query({ q: 'a'.repeat(101) });

    expect(response.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  const app = createTestApp();

  it('returns the product', async () => {
    const response = await request(app).get('/api/products/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mensJacket);
  });

  it('returns a 404 for an unknown product', async () => {
    const response = await request(app).get('/api/products/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
  });
});

describe('GET /api/categories', () => {
  it('lists every category with its slug', async () => {
    const response = await request(createTestApp()).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual({ slug: 'mens-clothing', name: "men's clothing" });
    expect(response.body).toHaveLength(4);
  });
});

describe('GET /api/categories/:slug/products', () => {
  it('splits the category into top rated and others', async () => {
    const app = createTestApp({ topRatedIds: ['2'] });

    const response = await request(app).get('/api/categories/mens-clothing/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      category: { slug: 'mens-clothing', name: "men's clothing" },
      topRated: [mensTShirt],
      others: [mensJacket],
    });
  });

  it('returns a 404 for an unknown category', async () => {
    const response = await request(createTestApp()).get('/api/categories/unknown/products');

    expect(response.status).toBe(404);
  });
});

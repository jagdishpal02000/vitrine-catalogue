import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ERRORS } from '../src/constants/index.js';
import { AppError } from '../src/utils/errors.js';
import { mensJacket, mensTShirt, silverBracelet, womensRainJacket } from './fixtures.js';
import { createTestApp } from './helpers.js';

describe('GET /api/v1/top-rated', () => {
  it("returns the owner's picks in order", async () => {
    const app = createTestApp({ topRatedIds: ['5', '1'] });

    const response = await request(app).get('/api/v1/top-rated');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([silverBracelet, mensJacket]);
  });

  it('returns a 502 when the product source is down', async () => {
    const app = createTestApp({
      loadProducts: () => Promise.reject(new AppError(ERRORS.UPSTREAM_UNAVAILABLE)),
    });

    const response = await request(app).get('/api/v1/top-rated');

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({ error: { code: 'UPSTREAM_UNAVAILABLE' } });
  });
});

describe('GET /api/v1/search', () => {
  const app = createTestApp();

  it('returns only the products that match the term', async () => {
    const response = await request(app).get('/api/v1/search').query({ q: 'jacket' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([mensJacket, womensRainJacket]);
  });

  it('rejects an empty term with a 400', async () => {
    const response = await request(app).get('/api/v1/search').query({ q: '  ' });

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
      .get('/api/v1/search')
      .query({ q: 'a'.repeat(101) });

    expect(response.status).toBe(400);
  });
});

describe('GET /api/v1/products/:id', () => {
  const app = createTestApp();

  it('returns the product', async () => {
    const response = await request(app).get('/api/v1/products/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mensJacket);
  });

  it('returns a 404 for an unknown product', async () => {
    const response = await request(app).get('/api/v1/products/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
  });

  it('has no reserved IDs: "top-rated" and "search" are just unknown products', async () => {
    for (const id of ['top-rated', 'search']) {
      const response = await request(app).get(`/api/v1/products/${id}`);

      expect(response.status).toBe(404);
    }
  });
});

describe('GET /api/v1/categories', () => {
  it('lists every category with its slug', async () => {
    const response = await request(createTestApp()).get('/api/v1/categories');

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual({ slug: 'mens-clothing', name: "men's clothing" });
    expect(response.body).toHaveLength(4);
  });
});

describe('GET /api/v1/categories/:slug/products', () => {
  it('splits the category into top rated and others', async () => {
    const app = createTestApp({ topRatedIds: ['2'] });

    const response = await request(app).get('/api/v1/categories/mens-clothing/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      category: { slug: 'mens-clothing', name: "men's clothing" },
      topRated: [mensTShirt],
      others: [mensJacket],
    });
  });

  it('returns a 404 for an unknown category', async () => {
    const response = await request(createTestApp()).get('/api/v1/categories/unknown/products');

    expect(response.status).toBe(404);
  });
});

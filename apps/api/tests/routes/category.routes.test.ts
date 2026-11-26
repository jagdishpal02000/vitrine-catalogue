import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { mensJacket, mensTShirt } from '../fixtures.js';
import { createTestApp } from '../helpers.js';

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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryCache } from '../../src/infra/cache.js';
import { createFakeStoreProductRepository } from '../../src/repositories/fakeStore.product.repository.js';

describe('createFakeStoreProductRepository', () => {
  const fakeStoreItem = {
    id: 1,
    title: 'Mens Cotton Jacket',
    price: 55.99,
    description: 'Warm.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/1.png',
    rating: { rate: 4.7, count: 500 },
  };

  function stubFetch(response: Response) {
    const fetchMock = vi.fn(() => Promise.resolve(response));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  const createRepository = () =>
    createFakeStoreProductRepository('https://fake.store', createMemoryCache());

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps Fake Store products to our model', async () => {
    stubFetch(Response.json([fakeStoreItem]));

    expect(await createRepository().findById('1')).toEqual({
      id: '1',
      title: 'Mens Cotton Jacket',
      description: 'Warm.',
      price: 55.99,
      imageUrl: 'https://fakestoreapi.com/img/1.png',
      category: { slug: 'mens-clothing', name: "men's clothing" },
      rating: { average: 4.7, count: 500 },
    });
  });

  it('calls Fake Store once and answers later queries from the cache', async () => {
    const fetchMock = stubFetch(Response.json([fakeStoreItem]));
    const repository = createRepository();

    await repository.findById('1');
    await repository.findCategories();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://fake.store/products', expect.anything());
  });

  it('turns an upstream error into a 502', async () => {
    stubFetch(new Response('Service Unavailable', { status: 503 }));

    await expect(createRepository().findById('1')).rejects.toMatchObject({
      statusCode: 502,
      code: 'UPSTREAM_UNAVAILABLE',
    });
  });

  it('turns unexpected data into a 502 instead of passing it on', async () => {
    stubFetch(Response.json([{ id: 'not-a-number' }]));

    await expect(createRepository().findById('1')).rejects.toMatchObject({ statusCode: 502 });
  });
});

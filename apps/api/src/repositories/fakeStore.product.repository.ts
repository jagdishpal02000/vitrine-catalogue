import { z } from 'zod';
import { PRODUCTS_CACHE_TTL_MS } from '../constants/index.js';
import type { Cache } from '../infra/cache.js';
import { fetchJson } from '../infra/httpClient.js';
import type { Product } from '../models/product.model.js';
import { slugify } from '../utils/text.js';
import { createInMemoryProductRepository } from './inMemory.product.repository.js';
import type { ProductRepository } from './product.repository.js';

// Fake Store's product shape. It never leaves this file: the rest of the app only uses our Product model.
const fakeStoreProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({ rate: z.number(), count: z.number() }).optional(),
});

type FakeStoreProduct = z.infer<typeof fakeStoreProductSchema>;

function toProduct(item: FakeStoreProduct): Product {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    price: item.price,
    imageUrl: item.image,
    category: { slug: slugify(item.category), name: item.category },
    rating: item.rating && { average: item.rating.rate, count: item.rating.count },
  };
}

/**
 * Products from the Fake Store API. Fake Store has no search and answers unknown IDs with
 * HTTP 200 and an empty body, so we load all products in one call, cache them,
 * and answer every query in memory.
 */
export function createFakeStoreProductRepository(baseUrl: string, cache: Cache): ProductRepository {
  const loadProducts = () =>
    cache.getOrSet('fake-store:products', PRODUCTS_CACHE_TTL_MS, async () => {
      const items = await fetchJson(`${baseUrl}/products`, z.array(fakeStoreProductSchema));
      return items.map(toProduct);
    });

  return createInMemoryProductRepository(loadProducts);
}

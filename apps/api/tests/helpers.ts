import { createApp } from '../src/app.js';
import type { Product } from '../src/models/product.model.js';
import { createInMemoryProductRepository } from '../src/repositories/inMemory.product.repository.js';
import { createCatalogueService } from '../src/services/catalogue.service.js';
import { products } from './fixtures.js';

interface TestAppOptions {
  topRatedIds?: string[];
  loadProducts?: () => Promise<Product[]>;
}

/** The real app wired to fixture data instead of Fake Store. */
export function createTestApp({
  topRatedIds = ['1', '5'],
  loadProducts = () => Promise.resolve(products),
}: TestAppOptions = {}) {
  const productRepository = createInMemoryProductRepository(loadProducts);

  return createApp({
    catalogueService: createCatalogueService(productRepository, topRatedIds),
  });
}

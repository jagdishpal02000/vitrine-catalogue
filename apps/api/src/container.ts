import { config } from './config/env.js';
import { createMemoryCache } from './infra/cache.js';
import { createFakeStoreProductRepository } from './repositories/fakeStore.product.repository.js';
import type { Services } from './routes/index.js';
import { createCatalogueService } from './services/catalogue.service.js';

/**
 * Composition root: the one place that decides which implementations the app uses.
 * Changing the product data source means changing the repository created here.
 */
export function createServices(): Services {
  const productRepository = createFakeStoreProductRepository(
    config.FAKE_STORE_BASE_URL,
    createMemoryCache(),
  );

  return {
    catalogueService: createCatalogueService(productRepository, config.TOP_RATED_PRODUCT_IDS),
  };
}

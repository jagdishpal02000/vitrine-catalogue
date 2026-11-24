import type { Category, Product } from '../models/product.model.js';
import { matchesSearch } from '../utils/search.js';
import type { ProductRepository } from './product.repository.js';

/**
 * Answers every query from the full product list that `loadProducts` returns.
 * Used for Fake Store (20 products, no search or category slugs) and, with fixtures, in tests.
 */
export function createInMemoryProductRepository(
  loadProducts: () => Promise<Product[]>,
): ProductRepository {
  return {
    async findById(id) {
      const products = await loadProducts();
      return products.find((product) => product.id === id);
    },

    async findByCategory(categorySlug) {
      const products = await loadProducts();
      return products.filter((product) => product.category.slug === categorySlug);
    },

    async findCategories() {
      const products = await loadProducts();
      const categoriesBySlug = new Map<string, Category>(
        products.map((product) => [product.category.slug, product.category]),
      );
      return [...categoriesBySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
    },

    async search(query) {
      const products = await loadProducts();
      return products.filter((product) => matchesSearch(product, query));
    },
  };
}

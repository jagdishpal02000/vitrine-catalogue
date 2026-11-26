import { CATEGORY_TOP_RATED_FALLBACK_COUNT, ERRORS } from '../constants/index.js';
import { logger } from '../infra/logger.js';
import type { CategoryPage, Product } from '../models/product.model.js';
import type { ProductRepository } from '../repositories/product.repository.js';
import { AppError } from '../utils/errors.js';

/**
 * Catalogue business rules.
 * `topRatedIds` are the business owner's "top rated" picks, in the order they should be shown.
 */
export function createCatalogueService(
  productRepository: ProductRepository,
  topRatedIds: string[],
) {
  return {
    /** Home page: the owner's picks, in order. Picks that no longer exist are skipped, not fatal. */
    async getTopRatedProducts(): Promise<Product[]> {
      const picks = await Promise.all(topRatedIds.map((id) => productRepository.findById(id)));
      const missingIds = topRatedIds.filter((_id, index) => picks[index] === undefined);
      if (missingIds.length > 0) {
        logger.warn(`Top-rated product IDs not found: ${missingIds.join(', ')}`);
      }
      return picks.filter((product) => product !== undefined);
    },

    /**
     * Category page: the owner's picks in this category as "top rated", the rest as "others".
     * If the owner picked nothing here, the best customer ratings fill in, so the section is never empty.
     */
    async getCategoryPage(slug: string): Promise<CategoryPage> {
      const categories = await productRepository.findCategories();
      const category = categories.find((item) => item.slug === slug);
      if (!category) throw new AppError(ERRORS.CATEGORY_NOT_FOUND);

      const products = await productRepository.findByCategory(slug);
      const picks = pickInOrder(products, topRatedIds);
      const topRated =
        picks.length > 0 ? picks : bestRated(products, CATEGORY_TOP_RATED_FALLBACK_COUNT);
      const others = products.filter((product) => !topRated.includes(product));
      return { category, topRated, others };
    },

    async getProduct(id: string): Promise<Product> {
      const product = await productRepository.findById(id);
      if (!product) throw new AppError(ERRORS.PRODUCT_NOT_FOUND);
      return product;
    },

    listCategories() {
      return productRepository.findCategories();
    },

    searchProducts(query: string) {
      return productRepository.search(query);
    },
  };
}

export type CatalogueService = ReturnType<typeof createCatalogueService>;

/** The products whose IDs are in `ids`, in the order of `ids`. */
function pickInOrder(products: Product[], ids: string[]): Product[] {
  return ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product !== undefined);
}

/** The `count` products with the highest customer rating. */
function bestRated(products: Product[], count: number): Product[] {
  return [...products]
    .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
    .slice(0, count);
}

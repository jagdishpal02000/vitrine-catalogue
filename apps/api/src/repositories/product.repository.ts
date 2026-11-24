import type { Category, Product } from '../models/product.model.js';

/**
 * Everything the app needs from a product data source. Fake Store implements it today;
 * a database or a commerce platform can implement it later without changes anywhere else.
 */
export interface ProductRepository {
  findById(id: string): Promise<Product | undefined>;
  findByCategory(categorySlug: string): Promise<Product[]>;
  findCategories(): Promise<Category[]>;
  search(query: string): Promise<Product[]>;
}

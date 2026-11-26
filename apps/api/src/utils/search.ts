import type { Product } from '../models/product.model.js';
import { toWords } from './text.js';

/**
 * A product matches when every word of the query is the start of a word in its title,
 * description or category, ignoring case. So "jack" finds jackets, but "men" does not match "women".
 */
export function matchesSearch(product: Product, query: string): boolean {
  const queryWords = toWords(query);
  if (queryWords.length === 0) return false;

  const productWords = toWords(`${product.title} ${product.description} ${product.category.name}`);
  return queryWords.every((queryWord) => productWords.some((word) => word.startsWith(queryWord)));
}

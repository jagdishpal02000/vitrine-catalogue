import { describe, expect, it } from 'vitest';
import { createInMemoryProductRepository } from '../../src/repositories/inMemory.product.repository.js';
import { goldRing, mensJacket, products, silverBracelet, womensRainJacket } from '../fixtures.js';

describe('createInMemoryProductRepository', () => {
  const repository = createInMemoryProductRepository(() => Promise.resolve(products));

  it('finds a product by id, or nothing for an unknown id', async () => {
    expect(await repository.findById('1')).toEqual(mensJacket);
    expect(await repository.findById('999')).toBeUndefined();
  });

  it('finds the products in a category', async () => {
    expect(await repository.findByCategory('jewelery')).toEqual([goldRing, silverBracelet]);
  });

  it('lists each category once, sorted by name', async () => {
    const categories = await repository.findCategories();

    expect(categories.map((category) => category.name)).toEqual([
      'electronics',
      'jewelery',
      "men's clothing",
      "women's clothing",
    ]);
  });

  it('searches with the shared matching rules', async () => {
    expect(await repository.search('jacket')).toEqual([mensJacket, womensRainJacket]);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../src/infra/logger.js';
import { createInMemoryProductRepository } from '../src/repositories/inMemory.product.repository.js';
import { createCatalogueService } from '../src/services/catalogue.service.js';
import {
  hardDrive,
  keyboard,
  mensJacket,
  mensTShirt,
  monitor,
  products,
  silverBracelet,
  usbCable,
} from './fixtures.js';

const repository = createInMemoryProductRepository(() => Promise.resolve(products));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getTopRatedProducts (home page)', () => {
  it("returns the owner's picks in the owner's order", async () => {
    const service = createCatalogueService(repository, ['5', '1', '6']);

    expect(await service.getTopRatedProducts()).toEqual([silverBracelet, mensJacket, hardDrive]);
  });

  it('skips picks that no longer exist, and logs only the missing IDs', async () => {
    const warn = vi.spyOn(logger, 'warn');
    const service = createCatalogueService(repository, ['1', '999']);

    expect(await service.getTopRatedProducts()).toEqual([mensJacket]);
    expect(warn).toHaveBeenCalledWith('Top-rated product IDs not found: 999');
  });
});

describe('getCategoryPage', () => {
  it("shows the owner's picks in the category as top rated, and the rest as others", async () => {
    const service = createCatalogueService(repository, ['2', '5']);

    const page = await service.getCategoryPage('mens-clothing');

    expect(page.category).toEqual({ slug: 'mens-clothing', name: "men's clothing" });
    expect(page.topRated).toEqual([mensTShirt]);
    expect(page.others).toEqual([mensJacket]);
  });

  it('falls back to the 3 best customer ratings when the owner picked nothing in the category', async () => {
    const service = createCatalogueService(repository, ['1']);

    const page = await service.getCategoryPage('electronics');

    expect(page.topRated).toEqual([keyboard, usbCable, monitor]);
    expect(page.others).toEqual([hardDrive]);
  });

  it('returns a 404 for an unknown category', async () => {
    const service = createCatalogueService(repository, []);

    await expect(service.getCategoryPage('unknown')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('getProduct', () => {
  const service = createCatalogueService(repository, []);

  it('returns the product', async () => {
    expect(await service.getProduct('1')).toEqual(mensJacket);
  });

  it('returns a 404 for an unknown product', async () => {
    await expect(service.getProduct('999')).rejects.toMatchObject({ statusCode: 404 });
  });
});

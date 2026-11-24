import { createApp } from '../src/app.js';
import type { MailMessage, Mailer } from '../src/infra/mailer.js';
import type { Product } from '../src/models/product.model.js';
import { createInMemoryProductRepository } from '../src/repositories/inMemory.product.repository.js';
import { createCatalogueService } from '../src/services/catalogue.service.js';
import { createEnquiryService } from '../src/services/enquiry.service.js';
import { products } from './fixtures.js';

/** A mailer that records messages instead of sending them. */
export function createFakeMailer() {
  const sent: MailMessage[] = [];
  const mailer: Mailer = {
    send(message) {
      sent.push(message);
      return Promise.resolve();
    },
  };
  return { mailer, sent };
}

interface TestAppOptions {
  topRatedIds?: string[];
  loadProducts?: () => Promise<Product[]>;
  mailer?: Mailer;
}

/** The real app wired to fixture data and a fake mailer instead of Fake Store and SMTP. */
export function createTestApp({
  topRatedIds = ['1', '5'],
  loadProducts = () => Promise.resolve(products),
  mailer = createFakeMailer().mailer,
}: TestAppOptions = {}) {
  const productRepository = createInMemoryProductRepository(loadProducts);

  return createApp({
    catalogueService: createCatalogueService(productRepository, topRatedIds),
    enquiryService: createEnquiryService({
      productRepository,
      mailer,
      salesInboxEmail: 'sales@example.com',
      webBaseUrl: 'http://localhost:8080',
    }),
  });
}

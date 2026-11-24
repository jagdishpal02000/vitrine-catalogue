import { config } from './config/env.js';
import { createMemoryCache } from './infra/cache.js';
import { createSmtpMailer } from './infra/mailer.js';
import { createFakeStoreProductRepository } from './repositories/fakeStore.product.repository.js';
import type { Services } from './routes/index.js';
import { createCatalogueService } from './services/catalogue.service.js';
import { createEnquiryService } from './services/enquiry.service.js';

/**
 * Composition root: the one place that decides which implementations the app uses.
 * Changing the product data source or the email provider means changing what is created here.
 */
export function createServices(): Services {
  const productRepository = createFakeStoreProductRepository(
    config.FAKE_STORE_BASE_URL,
    createMemoryCache(),
  );

  const mailer = createSmtpMailer({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    user: config.SMTP_USER,
    password: config.SMTP_PASSWORD,
    from: config.MAIL_FROM,
  });

  return {
    catalogueService: createCatalogueService(productRepository, config.TOP_RATED_PRODUCT_IDS),
    enquiryService: createEnquiryService({
      productRepository,
      mailer,
      salesInboxEmail: config.SALES_INBOX_EMAIL,
      webBaseUrl: config.WEB_BASE_URL,
    }),
  };
}

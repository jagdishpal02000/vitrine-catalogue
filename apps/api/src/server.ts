import { createApp } from './app.js';
import { config } from './config/env.js';
import { createMemoryCache } from './infra/cache.js';
import { logger } from './infra/logger.js';
import { createSmtpMailer } from './infra/mailer.js';
import { createFakeStoreProductRepository } from './repositories/fakeStore.product.repository.js';
import { createCatalogueService } from './services/catalogue.service.js';
import { createEnquiryService } from './services/enquiry.service.js';

// The real implementations: products from Fake Store, email over SMTP. This is the only place that
// chooses them, so changing the data source or the email provider means changing one line here.
// Tests build the same app with fixture data and a fake mailer (tests/helpers.ts).
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

const app = createApp({
  catalogueService: createCatalogueService(productRepository, config.TOP_RATED_PRODUCT_IDS),
  enquiryService: createEnquiryService({
    productRepository,
    mailer,
    salesInboxEmail: config.SALES_INBOX_EMAIL,
    webBaseUrl: config.WEB_BASE_URL,
  }),
});

const server = app.listen(config.PORT, (error) => {
  if (error) throw error;
  logger.info(`Vitrine API listening on port ${config.PORT}`);
});

// Docker and ECS stop containers with SIGTERM: finish in-flight requests, then exit.
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

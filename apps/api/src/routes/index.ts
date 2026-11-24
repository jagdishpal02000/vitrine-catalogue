import { Router } from 'express';
import type { CatalogueService } from '../services/catalogue.service.js';
import type { EnquiryService } from '../services/enquiry.service.js';
import { createCategoryRouter } from './category.routes.js';
import { createEnquiryRouter } from './enquiry.routes.js';
import { createProductRouter } from './product.routes.js';

/** The services the routes depend on. Built in container.ts, or with fakes in tests. */
export interface Services {
  catalogueService: CatalogueService;
  enquiryService: EnquiryService;
}

/** Every API route. app.ts mounts this router under /api. */
export function createApiRouter(services: Services): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.use('/products', createProductRouter(services.catalogueService));
  router.use('/categories', createCategoryRouter(services.catalogueService));
  router.use('/enquiries', createEnquiryRouter(services.enquiryService));

  return router;
}

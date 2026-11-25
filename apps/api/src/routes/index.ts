import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '../docs/openapi.js';
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

  // Not versioned: Docker and load balancers check this, whichever API versions are live.
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.use('/v1', createV1Router(services));

  return router;
}

/**
 * Version 1 of the public API. A breaking change goes in a new /v2 router mounted next to this one,
 * so existing clients (such as a mobile app that cannot update instantly) keep working.
 */
function createV1Router(services: Services): Router {
  const router = Router();

  router.get('/docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  router.use(createProductRouter(services.catalogueService));
  router.use('/categories', createCategoryRouter(services.catalogueService));
  router.use('/enquiries', createEnquiryRouter(services.enquiryService));

  return router;
}

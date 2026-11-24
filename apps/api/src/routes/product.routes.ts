import { Router } from 'express';
import { createProductController } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.js';
import type { CatalogueService } from '../services/catalogue.service.js';
import { productParamsSchema, searchQuerySchema } from '../validators/product.validators.js';

export function createProductRouter(catalogueService: CatalogueService): Router {
  const controller = createProductController(catalogueService);
  const router = Router();

  // Fixed paths first, otherwise "/:id" would treat "top-rated" and "search" as product IDs.
  router.get('/top-rated', controller.getTopRated);
  router.get('/search', validate({ query: searchQuerySchema }), controller.search);
  router.get('/:id', validate({ params: productParamsSchema }), controller.getById);

  return router;
}

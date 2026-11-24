import { Router } from 'express';
import { createProductController } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.js';
import type { CatalogueService } from '../services/catalogue.service.js';
import { productParamsSchema, searchQuerySchema } from '../validators/product.validators.js';

/**
 * Product routes. Top rated and search live outside /products/ on purpose: product IDs are
 * opaque strings, so /products/:id must never have reserved words such as "search".
 */
export function createProductRouter(catalogueService: CatalogueService): Router {
  const controller = createProductController(catalogueService);
  const router = Router();

  router.get('/top-rated', controller.getTopRated);
  router.get('/search', validate({ query: searchQuerySchema }), controller.search);
  router.get('/products/:id', validate({ params: productParamsSchema }), controller.getById);

  return router;
}

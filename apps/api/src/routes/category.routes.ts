import { Router } from 'express';
import { createCategoryController } from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.js';
import type { CatalogueService } from '../services/catalogue.service.js';
import { categoryParamsSchema } from '../validators/category.validators.js';

export function createCategoryRouter(catalogueService: CatalogueService): Router {
  const controller = createCategoryController(catalogueService);
  const router = Router();

  router.get('/', controller.list);
  router.get('/:slug/products', validate({ params: categoryParamsSchema }), controller.getProducts);

  return router;
}

import type { Request, Response } from 'express';
import type { CatalogueService } from '../services/catalogue.service.js';

export function createCategoryController(catalogueService: CatalogueService) {
  return {
    list: async (_req: Request, res: Response) => {
      res.json(await catalogueService.listCategories());
    },

    getProducts: async (req: Request<{ slug: string }>, res: Response) => {
      res.json(await catalogueService.getCategoryPage(req.params.slug));
    },
  };
}

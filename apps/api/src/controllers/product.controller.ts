import type { Request, Response } from 'express';
import type { CatalogueService } from '../services/catalogue.service.js';
import type { SearchQuery } from '../validators/product.validators.js';

// Controllers translate HTTP into service calls. Input was already validated by the router,
// and any thrown error goes to the global error handler, so there is no try/catch here.
export function createProductController(catalogueService: CatalogueService) {
  return {
    getTopRated: async (_req: Request, res: Response) => {
      res.json(await catalogueService.getTopRatedProducts());
    },

    search: async (req: Request, res: Response) => {
      const { q } = req.query as SearchQuery;
      res.json(await catalogueService.searchProducts(q));
    },

    getById: async (req: Request<{ id: string }>, res: Response) => {
      res.json(await catalogueService.getProduct(req.params.id));
    },
  };
}

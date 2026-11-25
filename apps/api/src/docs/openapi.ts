import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { ERROR_CODES } from '../constants/index.js';
import {
  categoryPageSchema as CategoryPage,
  categorySchema as Category,
  productSchema as Product,
} from '../models/product.model.js';
import { categoryParamsSchema } from '../validators/category.validators.js';
import { enquirySchema as Enquiry } from '../validators/enquiry.validators.js';
import { productParamsSchema, searchQuerySchema } from '../validators/product.validators.js';

// The API docs are generated from the same zod schemas that validate requests,
// so the documentation cannot drift from what the API really accepts.
// Schemas named with zod's .meta({ id }) appear as reusable components in the docs.
const registry = new OpenAPIRegistry();

const ErrorResponse = z
  .object({
    error: z.object({
      code: z.enum(ERROR_CODES).meta({ description: 'Stable: apps map this to their own text' }),
      message: z.string().meta({ description: 'For developers, not for showing to end users' }),
      details: z.unknown().optional(),
    }),
  })
  .meta({ id: 'Error' });

const json = (schema: z.ZodType) => ({ 'application/json': { schema } });
const error = (description: string) => ({ description, content: json(ErrorResponse) });
const productSourceDown = error('The product data source is unavailable');

registry.registerPath({
  method: 'get',
  path: '/top-rated',
  tags: ['Products'],
  summary: "The business owner's top-rated picks, in display order (home page)",
  responses: {
    200: { description: 'Top-rated products', content: json(z.array(Product)) },
    502: productSourceDown,
  },
});

registry.registerPath({
  method: 'get',
  path: '/search',
  tags: ['Products'],
  summary: 'Products whose title, description or category match every word of the term',
  request: { query: searchQuerySchema },
  responses: {
    200: { description: 'Matching products', content: json(z.array(Product)) },
    400: error('Missing or invalid search term'),
    502: productSourceDown,
  },
});

registry.registerPath({
  method: 'get',
  path: '/products/{id}',
  tags: ['Products'],
  summary: 'One product',
  request: { params: productParamsSchema },
  responses: {
    200: { description: 'The product', content: json(Product) },
    404: error('Unknown product'),
    502: productSourceDown,
  },
});

registry.registerPath({
  method: 'get',
  path: '/categories',
  tags: ['Categories'],
  summary: 'Every category, sorted by name',
  responses: {
    200: { description: 'Categories', content: json(z.array(Category)) },
    502: productSourceDown,
  },
});

registry.registerPath({
  method: 'get',
  path: '/categories/{slug}/products',
  tags: ['Categories'],
  summary: 'A category page: its top-rated products first, then the others',
  request: { params: categoryParamsSchema },
  responses: {
    200: { description: 'The category page', content: json(CategoryPage) },
    404: error('Unknown category'),
    502: productSourceDown,
  },
});

registry.registerPath({
  method: 'post',
  path: '/enquiries',
  tags: ['Enquiries'],
  summary: 'Email an enquiry about a product to the sales inbox',
  request: { body: { content: json(Enquiry) } },
  responses: {
    202: { description: 'Enquiry sent', content: json(z.object({ message: z.string() })) },
    400: error('Invalid contact details'),
    404: error('Unknown product'),
    429: error('Too many enquiries from this client'),
    502: error('The email could not be sent'),
  },
});

/** The contract for version 1 of the API. The unversioned /api/health check is operational and not part of it. */
export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Vitrine API',
    version: '1.0.0',
    description: 'Product catalogue and enquiries for the Vitrine proof of concept.',
  },
  servers: [{ url: '/api/v1' }],
});

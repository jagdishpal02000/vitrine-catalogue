import { z } from 'zod';
import { SEARCH_QUERY_MAX_LENGTH } from '../constants/index.js';

/** Product IDs are opaque strings, so a future data source can use SKUs or UUIDs. */
export const productIdSchema = z.string().trim().min(1).max(64);

export const productParamsSchema = z.object({ id: productIdSchema });

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Enter a search term').max(SEARCH_QUERY_MAX_LENGTH),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

import { z } from 'zod';
import { FIELD_LIMITS } from '../constants/index.js';

/** Product IDs are opaque strings, so a future data source can use SKUs or UUIDs. */
export const productIdSchema = z.string().trim().min(1).max(FIELD_LIMITS.id);

export const productParamsSchema = z.object({ id: productIdSchema });

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Enter a search term').max(FIELD_LIMITS.searchQuery),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

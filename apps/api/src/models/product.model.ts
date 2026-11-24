import { z } from 'zod';

// Our own product model. Every data source is mapped to it, so nothing outside a repository
// depends on how a particular source (such as Fake Store) shapes its data.

export const categorySchema = z.object({
  slug: z.string(),
  name: z.string(),
});

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  category: categorySchema,
  rating: z.object({ average: z.number(), count: z.number() }).optional(),
});

export const categoryPageSchema = z.object({
  category: categorySchema,
  topRated: z.array(productSchema),
  others: z.array(productSchema),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type CategoryPage = z.infer<typeof categoryPageSchema>;

import { z } from 'zod';

export const categoryParamsSchema = z.object({ slug: z.string().trim().min(1).max(64) });

import { z } from 'zod';
import { FIELD_LIMITS } from '../constants/index.js';

export const categoryParamsSchema = z.object({
  slug: z.string().trim().min(1).max(FIELD_LIMITS.id),
});

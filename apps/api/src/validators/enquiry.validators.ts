import { z } from 'zod';
import { productIdSchema } from './product.validators.js';

/** What a customer sends with an enquiry. Unknown fields are rejected. */
export const enquirySchema = z
  .strictObject({
    productId: productIdSchema,
    name: z.string().trim().min(1, 'Enter your name').max(100),
    email: z.email('Enter a valid email address').max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^[\d\s()+-]*$/, 'Enter a valid phone number')
      .optional(),
    message: z.string().trim().max(2000).optional(),
  })
  .meta({ id: 'Enquiry' });

export type Enquiry = z.infer<typeof enquirySchema>;

import { z } from 'zod';
import { FIELD_LIMITS, VALIDATION_MESSAGES } from '../constants/index.js';
import { productIdSchema } from './product.validators.js';

/** What a customer sends with an enquiry. Unknown fields are rejected. */
export const enquirySchema = z
  .strictObject({
    productId: productIdSchema,
    name: z.string().trim().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).max(FIELD_LIMITS.name),
    email: z.email(VALIDATION_MESSAGES.EMAIL_INVALID).max(FIELD_LIMITS.email),
    phone: z
      .string()
      .trim()
      .max(FIELD_LIMITS.phone)
      .regex(/^[\d\s()+-]*$/, VALIDATION_MESSAGES.PHONE_INVALID)
      .optional(),
    message: z.string().trim().max(FIELD_LIMITS.message).optional(),
  })
  .meta({ id: 'Enquiry' });

export type Enquiry = z.infer<typeof enquirySchema>;

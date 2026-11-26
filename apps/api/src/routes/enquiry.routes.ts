import { Router } from 'express';
import { RATE_LIMITS } from '../constants/index.js';
import { createEnquiryController } from '../controllers/enquiry.controller.js';
import { createRateLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import type { EnquiryService } from '../services/enquiry.service.js';
import { enquirySchema } from '../validators/enquiry.validators.js';

export function createEnquiryRouter(enquiryService: EnquiryService): Router {
  const controller = createEnquiryController(enquiryService);
  const router = Router();

  // The rate limit runs before validation, so invalid attempts count towards it too.
  router.post(
    '/',
    createRateLimiter(RATE_LIMITS.enquiries),
    validate({ body: enquirySchema }),
    controller.create,
  );

  return router;
}

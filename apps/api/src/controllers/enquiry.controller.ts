import type { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';
import type { EnquiryService } from '../services/enquiry.service.js';
import type { Enquiry } from '../validators/enquiry.validators.js';

export function createEnquiryController(enquiryService: EnquiryService) {
  return {
    create: async (req: Request, res: Response) => {
      await enquiryService.submitEnquiry(req.body as Enquiry);
      res.status(HTTP_STATUS.ACCEPTED).json({ message: SUCCESS_MESSAGES.ENQUIRY_SENT });
    },
  };
}

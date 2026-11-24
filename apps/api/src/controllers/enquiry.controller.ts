import type { Request, Response } from 'express';
import type { EnquiryService } from '../services/enquiry.service.js';
import type { Enquiry } from '../validators/enquiry.validators.js';

export function createEnquiryController(enquiryService: EnquiryService) {
  return {
    create: async (req: Request, res: Response) => {
      await enquiryService.submitEnquiry(req.body as Enquiry);
      res.status(202).json({ message: 'Thank you. Your enquiry has been sent to our sales team.' });
    },
  };
}

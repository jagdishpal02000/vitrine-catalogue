import { ERROR_CODES } from '../constants/index.js';
import { logger } from '../infra/logger.js';
import type { Mailer } from '../infra/mailer.js';
import type { Product } from '../models/product.model.js';
import type { ProductRepository } from '../repositories/product.repository.js';
import { AppError, getErrorMessage } from '../utils/errors.js';
import type { Enquiry } from '../validators/enquiry.validators.js';

interface EnquiryServiceDependencies {
  productRepository: ProductRepository;
  mailer: Mailer;
  salesInboxEmail: string;
  webBaseUrl: string;
}

export function createEnquiryService({
  productRepository,
  mailer,
  salesInboxEmail,
  webBaseUrl,
}: EnquiryServiceDependencies) {
  return {
    /** Emails the enquiry to the sales inbox. Resolves only once the mail server has accepted it. */
    async submitEnquiry(enquiry: Enquiry): Promise<void> {
      // Look the product up ourselves rather than trusting product details sent by the browser.
      const product = await productRepository.findById(enquiry.productId);
      if (!product) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product not found');

      try {
        await mailer.send({
          to: salesInboxEmail,
          replyTo: enquiry.email,
          subject: `New enquiry: ${product.title}`,
          text: formatEnquiryEmail(enquiry, product, `${webBaseUrl}/products/${product.id}`),
        });
      } catch (error) {
        logger.error(`Enquiry email for product ${product.id} failed: ${getErrorMessage(error)}`);
        throw new AppError(
          502,
          ERROR_CODES.EMAIL_FAILED,
          'We could not send your enquiry. Please try again.',
        );
      }

      logger.info(`Enquiry for product ${product.id} sent to the sales inbox`);
    },
  };
}

export type EnquiryService = ReturnType<typeof createEnquiryService>;

/** Plain text on purpose: nothing a customer types can be rendered as HTML in the sales inbox. */
function formatEnquiryEmail(enquiry: Enquiry, product: Product, productUrl: string): string {
  return [
    `New enquiry about "${product.title}".`,
    '',
    `Product:  ${product.title} (ID ${product.id})`,
    `Link:     ${productUrl}`,
    '',
    `Name:     ${enquiry.name}`,
    `Email:    ${enquiry.email}`,
    `Phone:    ${enquiry.phone || 'Not given'}`,
    '',
    'Message:',
    enquiry.message || 'No message.',
  ].join('\n');
}

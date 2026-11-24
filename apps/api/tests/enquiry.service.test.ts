import { describe, expect, it } from 'vitest';
import type { Mailer } from '../src/infra/mailer.js';
import { createInMemoryProductRepository } from '../src/repositories/inMemory.product.repository.js';
import { createEnquiryService } from '../src/services/enquiry.service.js';
import { products } from './fixtures.js';
import { createFakeMailer } from './helpers.js';

const repository = createInMemoryProductRepository(() => Promise.resolve(products));

const enquiry = {
  productId: '1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+44 20 7946 0000',
  message: 'Do you have this in large?',
};

function createService(mailer: Mailer) {
  return createEnquiryService({
    productRepository: repository,
    mailer,
    salesInboxEmail: 'sales@example.com',
    webBaseUrl: 'http://localhost:8080',
  });
}

describe('submitEnquiry', () => {
  it('emails the sales inbox with the product and contact details, replying to the customer', async () => {
    const { mailer, sent } = createFakeMailer();

    await createService(mailer).submitEnquiry(enquiry);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: 'sales@example.com',
      replyTo: 'ada@example.com',
      subject: 'New enquiry: Mens Cotton Jacket',
    });
    expect(sent[0]?.text).toContain('Ada Lovelace');
    expect(sent[0]?.text).toContain('+44 20 7946 0000');
    expect(sent[0]?.text).toContain('Do you have this in large?');
    expect(sent[0]?.text).toContain('http://localhost:8080/products/1');
  });

  it('says so when the optional details were not given', async () => {
    const { mailer, sent } = createFakeMailer();

    await createService(mailer).submitEnquiry({
      productId: '1',
      name: 'Ada',
      email: 'ada@example.com',
    });

    expect(sent[0]?.text).toContain('Phone:    Not given');
    expect(sent[0]?.text).toContain('No message.');
  });

  it('rejects an unknown product with a 404 and sends nothing', async () => {
    const { mailer, sent } = createFakeMailer();

    await expect(
      createService(mailer).submitEnquiry({ ...enquiry, productId: '999' }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(sent).toHaveLength(0);
  });

  it('reports a mail failure as a 502, so the customer is never thanked for a lost enquiry', async () => {
    const failingMailer: Mailer = { send: () => Promise.reject(new Error('SMTP down')) };

    await expect(createService(failingMailer).submitEnquiry(enquiry)).rejects.toMatchObject({
      statusCode: 502,
      code: 'EMAIL_FAILED',
    });
  });
});

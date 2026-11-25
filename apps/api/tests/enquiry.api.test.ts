import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { Mailer } from '../src/infra/mailer.js';
import { createFakeMailer, createTestApp } from './helpers.js';

const validEnquiry = { productId: '1', name: 'Ada Lovelace', email: 'ada@example.com' };

describe('POST /api/v1/enquiries', () => {
  it('accepts a valid enquiry with a 202 and emails the sales inbox', async () => {
    const { mailer, sent } = createFakeMailer();

    const response = await request(createTestApp({ mailer }))
      .post('/api/v1/enquiries')
      .send(validEnquiry);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      message: 'Thank you. Your enquiry has been sent to our sales team.',
    });
    expect(sent).toHaveLength(1);
  });

  it('rejects invalid details with a 400 per field and sends nothing', async () => {
    const { mailer, sent } = createFakeMailer();

    const response = await request(createTestApp({ mailer }))
      .post('/api/v1/enquiries')
      .send({ productId: '1', name: '', email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        details: [
          { field: 'name', message: 'Enter your name' },
          { field: 'email', message: 'Enter a valid email address' },
        ],
      },
    });
    expect(sent).toHaveLength(0);
  });

  it('rejects fields it does not expect', async () => {
    const response = await request(createTestApp())
      .post('/api/v1/enquiries')
      .send({ ...validEnquiry, isAdmin: true });

    expect(response.status).toBe(400);
  });

  it('returns a 404 for an unknown product', async () => {
    const response = await request(createTestApp())
      .post('/api/v1/enquiries')
      .send({ ...validEnquiry, productId: '999' });

    expect(response.status).toBe(404);
  });

  it('returns a 502 when the email cannot be sent', async () => {
    const failingMailer: Mailer = { send: () => Promise.reject(new Error('SMTP down')) };

    const response = await request(createTestApp({ mailer: failingMailer }))
      .post('/api/v1/enquiries')
      .send(validEnquiry);

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({ error: { code: 'EMAIL_FAILED' } });
  });

  it('allows 5 enquiries per client every 15 minutes', async () => {
    const app = createTestApp();

    for (let attempt = 1; attempt <= 5; attempt++) {
      await request(app).post('/api/v1/enquiries').send(validEnquiry).expect(202);
    }
    const response = await request(app).post('/api/v1/enquiries').send(validEnquiry);

    expect(response.status).toBe(429);
  });
});

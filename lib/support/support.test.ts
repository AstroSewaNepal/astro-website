import { describe, expect, it } from 'vitest';

import {
  emailUsBody,
  emailUsErrors,
  MAX_SUPPORT_IMAGES,
  supportImagesProblem,
  supportPath,
  type EmailUsForm,
} from './support';

const good: EmailUsForm = {
  name: 'Nibar',
  email: 'nibar@example.com',
  dialCode: '+977',
  phone: '9812345678',
  subject: 'Payment failed',
  description: 'The amount left my bank but the booking is not there.',
};

describe('emailUsErrors (the app emailUsSchema)', () => {
  it('accepts a complete form', () => {
    expect(emailUsErrors(good)).toEqual({});
  });

  it('gives the app messages, one per field', () => {
    expect(
      emailUsErrors({
        ...good,
        name: 'N',
        email: 'x',
        phone: '98123',
        subject: 'Hi',
        description: 'short',
      }),
    ).toEqual({
      name: 'Name must be at least 2 characters',
      email: 'Please enter a valid email address',
      phone: 'Mobile number must be at least 10 digits',
      subject: 'Subject must be at least 5 characters',
      description: 'Description must be at least 10 characters',
    });
    expect(emailUsErrors({ ...good, phone: '98123456ab' }).phone).toBe(
      'Mobile number must only contain numbers',
    );
    expect(emailUsErrors({ ...good, email: '  ' }).email).toBe('Email is required');
  });
});

describe('supportImagesProblem', () => {
  const photo = { type: 'image/jpeg', size: 1000 };
  it('allows up to the limit', () => {
    expect(supportImagesProblem(0, [photo, photo])).toBeNull();
    expect(supportImagesProblem(MAX_SUPPORT_IMAGES - 1, [photo])).toBeNull();
    expect(supportImagesProblem(MAX_SUPPORT_IMAGES - 1, [photo, photo])).toBe(
      `You can attach up to ${MAX_SUPPORT_IMAGES} photos.`,
    );
  });
  it('refuses non-photos and big files (the backend rules)', () => {
    expect(supportImagesProblem(0, [{ type: 'image/svg+xml', size: 10 }])).toMatch(/photo/);
    expect(supportImagesProblem(0, [{ type: 'application/pdf', size: 10 }])).toMatch(/photo/);
    expect(supportImagesProblem(0, [{ type: 'image/png', size: 6 * 1024 * 1024 }])).toMatch(/5 MB/);
  });
});

describe('emailUsBody', () => {
  it('uses the app field names and joins the phone like the backend stores it', () => {
    const file = new File(['x'], 'shot.png', { type: 'image/png' });
    const body = emailUsBody({ ...good, name: ' Nibar ' }, [file]);
    expect(body.get('name')).toBe('Nibar');
    expect(body.get('mobileNumber')).toBe('+977-9812345678');
    expect(body.get('subject')).toBe('Payment failed');
    expect(body.getAll('images')).toHaveLength(1);
  });
});

it('builds support paths for both areas', () => {
  expect(supportPath('client')).toBe('/client/support');
  expect(supportPath('astrologer', 'email-us')).toBe('/astrologer/support/email-us');
});

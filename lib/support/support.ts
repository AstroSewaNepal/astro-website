// Customer support (doc 13), as the app's CustomerSupport screens: Email Us (POST /customer-support/email-us),
// Contact Details and the legal pages. Shared by clients and astrologers.
import { z } from 'zod';

import type { PrivateKind } from '@/lib/account/nav';
import { imageProblem, joinPhone } from '@/lib/account/profile';

/** The app's ContactDetailsScreen (also the website footer). */
export const SUPPORT_PHONES = ['+977 9818080676'];
export const SUPPORT_EMAILS = ['support@astrosewa.com'];

/** The website's own legal pages (the app opens the same pages). */
export const POLICY_LINKS = [
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Pricing Policy', href: '/pricing-policy' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Child Safety Standards', href: '/child-safety' },
];

export const supportPath = (kind: PrivateKind, page?: 'email-us' | 'contact' | 'policies') =>
  `/${kind}/support${page ? `/${page}` : ''}`;

/** The app picks up to 5; the backend takes 10 raster images of 5 MB each. */
export const MAX_SUPPORT_IMAGES = 5;

/** The app's emailUsSchema: same limits and messages. */
export const emailUsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  dialCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/, 'Invalid country code'),
  phone: z
    .string()
    .trim()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(10, 'Mobile number must be exactly 10 digits')
    .regex(/^\d+$/, 'Mobile number must only contain numbers'),
  subject: z
    .string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
});

export type EmailUsForm = z.infer<typeof emailUsSchema>;
export type EmailUsErrors = Partial<Record<keyof EmailUsForm | 'images', string>>;

export function emailUsErrors(form: EmailUsForm): EmailUsErrors {
  const result = emailUsSchema.safeParse(form);
  if (result.success) return {};
  const errors: EmailUsErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof EmailUsForm;
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Why these photos can't be added (too many, not a photo, too big), or null. */
export function supportImagesProblem(
  current: number,
  picked: Pick<File, 'type' | 'size'>[],
): string | null {
  if (current + picked.length > MAX_SUPPORT_IMAGES)
    return `You can attach up to ${MAX_SUPPORT_IMAGES} photos.`;
  for (const file of picked) {
    const problem = imageProblem(file);
    if (problem) return problem;
  }
  return null;
}

/** Multipart body for POST /customer-support/email-us (the app's field names). */
export function emailUsBody(form: EmailUsForm, images: File[]): FormData {
  const body = new FormData();
  body.append('name', form.name.trim());
  body.append('email', form.email.trim());
  body.append('mobileNumber', joinPhone(form.dialCode.trim(), form.phone.trim()));
  body.append('subject', form.subject.trim());
  body.append('description', form.description.trim());
  for (const image of images) body.append('images', image, image.name);
  return body;
}

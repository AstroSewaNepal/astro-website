// Settings, as the app's screens (ap src/screens/Settings): menu, Security info, Change email, Delete account.
import { z } from 'zod';

import type { PrivateKind } from '@/lib/account/nav';

/** Settings pages of an account area (the astrologer's Settings tab links Security the same way). */
export const settingsPaths = (kind: PrivateKind) => {
  const root = `/${kind}/settings`;
  return {
    root,
    security: `${root}/security`,
    blockedUsers: `${root}/security/blocked-users`,
    changeEmail: `${root}/change-email`,
    deleteAccount: `${root}/delete-account`,
  };
};

export const OTP_LENGTH = 6;

/** Same rules and messages as the app's changeEmailSchema. The backend checks them again. */
const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Please enter a valid email address'));

export const changeEmailSchema = z
  .object({ newEmail: emailField, confirmNewEmail: emailField })
  .refine(d => d.newEmail.toLowerCase() === d.confirmNewEmail.toLowerCase(), {
    message: 'Emails do not match',
    path: ['confirmNewEmail'],
  });

export type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

/** Digits only, at most OTP_LENGTH (paste-friendly: "123 456" becomes "123456"). */
export const cleanOtp = (text: string) => text.replace(/\D/g, '').slice(0, OTP_LENGTH);

/** The app's reasons. The app doesn't send the answer to the backend (DELETE /users/me takes no body); nor do we. */
export const DELETE_REASONS = [
  { value: 'not_using', label: 'I am no longer using my account' },
  { value: 'too_expensive', label: 'The service is too expensive' },
  { value: 'dont_understand', label: "I don't understand how to use it" },
  { value: 'no_longer_require', label: 'I no longer require the AstroSewa service' },
  { value: 'rarely_use', label: 'I rarely use the service and find it unnecessary to continue.' },
  { value: 'not_satisfied', label: 'I am not satisfied with the service' },
  { value: 'other', label: 'Other' },
] as const;

export type DeleteReason = (typeof DELETE_REASONS)[number]['value'];

export function canConfirmDeletion(reason: DeleteReason | null, otherText: string): boolean {
  if (!reason) return false;
  return reason !== 'other' || otherText.trim() !== '';
}

export const DELETE_WARNING =
  'Once you request deletion, your account will be immediately deactivated. You will have a 30-day window to log back in and cancel the deletion. After 30 days, your profile, personal information, uploaded images, and all astrological reports will be permanently removed from our system. Please note: payment receipts are retained for legal and tax compliance. This action cannot be reversed after 30 days.';

export const DELETE_CONFIRM = {
  title: 'Are you sure you want to delete your account?',
  message:
    'Your account will be immediately deactivated. You have 30 days to log back in and cancel before your data is permanently deleted. After 30 days, this cannot be reversed.',
};

export type SecuritySection = {
  title: string;
  content: string;
  link?: { label: string; href: string };
};

/** The app's Security texts, made true for the website (no Khalti, which the web doesn't offer; no app version). */
export const SECURITY_SECTIONS: SecuritySection[] = [
  {
    title: 'Data Privacy Statement',
    content:
      "Your personal information — including your name, email, and profile details — is used solely to provide AstroSewa's services. Sensitive data such as birth details entered for kundali or horoscope generation is never shared without your knowledge.",
    link: { label: 'Read our full Privacy Policy', href: '/privacy-policy' },
  },
  {
    title: 'Data Encryption',
    content:
      'All data transmitted between your device and our servers is protected using industry-standard SSL/TLS encryption. Your data is also encrypted at rest on our secure cloud servers.',
  },
  {
    title: 'Account Protection',
    content:
      "Your account is secured through Google Sign-In, which uses Google's own industry-leading security infrastructure. We recommend keeping your Google account secure with a strong password and two-factor authentication enabled on your Google account.",
  },
  {
    title: 'Payment Security',
    content:
      'AstroSewa does not store your card or bank details. All payments are processed securely through eSewa, Fonepay and Himalayan Bank (cards). We only record whether your payment was successful or failed.',
  },
  {
    title: 'Third-Party Services',
    content:
      'AstroSewa uses trusted third-party services including Firebase (push notifications), LiveKit (audio/video calls and live streams), Amazon Web Services (secure media storage), Google (sign-in and place search), eSewa, Fonepay and Himalayan Bank (payments), and VedAstro (astrological calculations). All third-party partners maintain their own privacy and security standards. See our Privacy Policy for full details.',
  },
  {
    title: 'User Control and Consent',
    content:
      'You are in control of your data. You can update your profile or permanently delete your account and personal data at any time. To raise a privacy concern, contact us at contact@astrosewa.com',
  },
  {
    title: 'Website Updates',
    content: 'The website is updated regularly to patch vulnerabilities and maintain security.',
  },
];

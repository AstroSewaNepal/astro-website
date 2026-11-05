// Edit profile, as the app's client screen (ap src/screens/EditProfile/User): the rules, and the backend's shapes.
import { z } from 'zod';

/** GET /users/me, the parts the profile uses. */
export type MeResponse = {
  user: {
    _id: string;
    email: string;
    fullName?: string;
    phoneNumber?: string | null;
    gender?: string | null;
    isPrivateRelayEmail?: boolean;
  };
  userDetails?: { gender?: string | null } | null;
  profilePicture?: { _id: string; url: string } | null;
  userMedia?: { media?: { _id: string; url: string }[] } | null;
};

export type GenderOption = { value: string; label: string };

/** Backend limits (user.controller PUT /users/me): 5 MB per image, raster only. The app shows at most 6 photos. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY_PHOTOS = 6;
export const DEFAULT_DIAL_CODE = '+977';

/** Why an image can't be uploaded, or null when it can. */
export function imageProblem(file: Pick<File, 'type' | 'size'>): string | null {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return 'Choose a photo (JPG, PNG, WebP or HEIC).';
  if (file.size > MAX_IMAGE_BYTES) return 'Each photo must be 5 MB or smaller.';
  return null;
}

/** The backend stores phones as `+977-9812345678`; older rows may have no code. */
export function splitPhone(stored: string | null | undefined): { dialCode: string; phone: string } {
  if (!stored) return { dialCode: DEFAULT_DIAL_CODE, phone: '' };
  const dash = stored.indexOf('-');
  if (dash < 0) return { dialCode: DEFAULT_DIAL_CODE, phone: stored };
  return { dialCode: stored.slice(0, dash) || DEFAULT_DIAL_CODE, phone: stored.slice(dash + 1) };
}

export function joinPhone(dialCode: string, phone: string): string {
  return `${dialCode}-${phone}`;
}

/** Same rules and messages as the app's editUserProfileSchema. */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  dialCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/, 'Invalid country code'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^\d+$/, 'Phone number must only contain numbers'),
  gender: z.string().optional(),
});

export type ProfileForm = z.infer<typeof profileSchema>;

/** The gender saved on the account, matched to one of the options (the app checks both places it can live). */
export function currentGender(me: MeResponse, options: GenderOption[]): string {
  const saved = me.userDetails?.gender ?? me.user.gender ?? '';
  if (!saved) return '';
  const match = options.find(
    o => o.value.toLowerCase() === saved.toLowerCase() || o.label.toLowerCase() === saved.toLowerCase(),
  );
  return match?.value ?? '';
}

/** Body of PUT /users/me: the fields, plus any new profile picture and new gallery photos. */
export function profileFormData(form: ProfileForm, newPicture: File | null, newPhotos: File[]): FormData {
  const body = new FormData();
  body.append('fullName', form.name.trim());
  body.append('phoneNumber', joinPhone(form.dialCode, form.phone.trim()));
  if (form.gender) body.append('gender', form.gender);
  if (newPicture) body.append('profilePicture', newPicture);
  for (const photo of newPhotos) body.append('media', photo);
  return body;
}

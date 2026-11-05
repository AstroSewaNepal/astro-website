import { describe, expect, it } from 'vitest';

import {
  currentGender,
  imageProblem,
  type MeResponse,
  profileFormData,
  profileSchema,
  splitPhone,
} from './profile';

describe('phone numbers', () => {
  it('reads the backend’s +code-number form', () => {
    expect(splitPhone('+977-9812345678')).toEqual({ dialCode: '+977', phone: '9812345678' });
    expect(splitPhone('+1-2025550123')).toEqual({ dialCode: '+1', phone: '2025550123' });
  });
  it('defaults to Nepal when there is no code or no phone', () => {
    expect(splitPhone('9812345678')).toEqual({ dialCode: '+977', phone: '9812345678' });
    expect(splitPhone(null)).toEqual({ dialCode: '+977', phone: '' });
  });
});

describe('profileSchema (the app’s rules)', () => {
  const valid = { name: 'Rina Chamling', dialCode: '+977', phone: '9812345678', gender: 'FEMALE' };
  const error = (patch: object) => profileSchema.safeParse({ ...valid, ...patch }).error?.issues[0]?.message;

  it('accepts a valid profile', () => expect(profileSchema.safeParse(valid).success).toBe(true));
  it('checks the name', () => {
    expect(error({ name: '' })).toBe('Name is required');
    expect(error({ name: 'R' })).toBe('Name must be at least 2 characters');
    expect(error({ name: 'x'.repeat(51) })).toBe('Name must not exceed 50 characters');
  });
  it('checks the phone', () => {
    expect(error({ phone: '98123' })).toBe('Phone number must be at least 10 digits');
    expect(error({ phone: '98123456789' })).toBe('Phone number must be exactly 10 digits');
    expect(error({ phone: '98123-5678' })).toBe('Phone number must only contain numbers');
    expect(error({ dialCode: '977' })).toBe('Invalid country code');
  });
});

describe('images', () => {
  it('takes raster photos up to 5 MB', () => {
    expect(imageProblem({ type: 'image/jpeg', size: 5 * 1024 * 1024 })).toBeNull();
    expect(imageProblem({ type: 'image/heic', size: 1000 })).toBeNull();
  });
  it('refuses SVG, non-images and big files', () => {
    expect(imageProblem({ type: 'image/svg+xml', size: 10 })).not.toBeNull();
    expect(imageProblem({ type: 'application/pdf', size: 10 })).not.toBeNull();
    expect(imageProblem({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).toBe('Each photo must be 5 MB or smaller.');
  });
});

describe('currentGender', () => {
  const me = (gender: string | null): MeResponse => ({ user: { _id: 'u', email: 'e' }, userDetails: { gender } });
  const options = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];
  it('matches by value or label, in any case', () => {
    expect(currentGender(me('female'), options)).toBe('FEMALE');
    expect(currentGender(me('Male'), options)).toBe('MALE');
    expect(currentGender(me(null), options)).toBe('');
    expect(currentGender(me('UNKNOWN'), options)).toBe('');
  });
});

describe('profileFormData', () => {
  it('sends the fields the backend takes, and only new images', () => {
    const picture = new File(['p'], 'p.jpg', { type: 'image/jpeg' });
    const photo = new File(['g'], 'g.png', { type: 'image/png' });
    const body = profileFormData({ name: ' Rina ', dialCode: '+977', phone: '9812345678', gender: '' }, picture, [photo]);
    expect(body.get('fullName')).toBe('Rina');
    expect(body.get('phoneNumber')).toBe('+977-9812345678');
    expect(body.has('gender')).toBe(false);
    expect(body.get('profilePicture')).toBe(picture);
    expect(body.getAll('media')).toEqual([photo]);
    expect(body.has('fcmToken')).toBe(false);
  });
});

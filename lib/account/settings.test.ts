import { describe, expect, it } from 'vitest';

import { canConfirmDeletion, changeEmailSchema, cleanOtp, settingsPaths } from './settings';

describe('change email', () => {
  it('needs the same valid address twice, ignoring case and spaces', () => {
    expect(
      changeEmailSchema.safeParse({ newEmail: 'A@b.com ', confirmNewEmail: 'a@B.com' }).success,
    ).toBe(true);
    expect(
      changeEmailSchema.safeParse({ newEmail: 'a@b.com', confirmNewEmail: 'c@b.com' }).success,
    ).toBe(false);
    expect(changeEmailSchema.safeParse({ newEmail: 'nope', confirmNewEmail: 'nope' }).success).toBe(
      false,
    );
    expect(changeEmailSchema.safeParse({ newEmail: '', confirmNewEmail: '' }).success).toBe(false);
  });
  it('keeps only 6 digits of a typed or pasted code', () => {
    expect(cleanOtp('123 456')).toBe('123456');
    expect(cleanOtp('12a34567')).toBe('123456');
  });
});

describe('delete account', () => {
  it('needs a reason, and text when the reason is Other', () => {
    expect(canConfirmDeletion(null, '')).toBe(false);
    expect(canConfirmDeletion('too_expensive', '')).toBe(true);
    expect(canConfirmDeletion('other', '   ')).toBe(false);
    expect(canConfirmDeletion('other', 'moving abroad')).toBe(true);
  });
});

it('builds settings paths per account kind', () => {
  expect(settingsPaths('client').deleteAccount).toBe('/client/settings/delete-account');
  expect(settingsPaths('astrologer').security).toBe('/astrologer/settings/security');
});

import { describe, expect, it } from 'vitest';

import {
  bankAppLink,
  localGatewaysTake,
  notPaidMessage,
  outcomeOf,
  readStarted,
  readStatus,
  returnedPayment,
  startRequest,
  statusPath,
  type Purchase,
} from './checkout';
import { parsePending } from './pending';

const pkg: Purchase = {
  kind: 'package',
  packageId: 'p1',
  astrologerId: 'a1',
  scheduledStartAt: '2026-11-20T09:00:00',
  scheduledEndAt: '2026-11-20T09:30:00',
  timezone: 'Asia/Kathmandu',
};

describe('startRequest', () => {
  it('starts packages on the routes where the server books the slot', () => {
    const slot = {
      packageId: 'p1',
      astrologerId: 'a1',
      scheduledStartAt: '2026-11-20T09:00:00',
      scheduledEndAt: '2026-11-20T09:30:00',
      timezone: 'Asia/Kathmandu',
      countryCode: 'NP',
    };
    expect(startRequest(pkg, 'esewa', 'NP')).toEqual({
      path: '/subscription/payments/esewa/packages/initiate',
      body: slot,
    });
    expect(startRequest(pkg, 'fonepay', 'NP').path).toBe(
      '/subscription/payments/fonepay/packages/initiate',
    );
    expect(startRequest(pkg, 'card', 'NP').path).toBe(
      '/subscription/payments/hbl/packages/initiate',
    );
  });

  it('asks the server to deliver plans and gifts, with a fresh order id each time', () => {
    const plan: Purchase = { kind: 'plan', planId: 'pl1', astrologerId: 'a1' };
    const first = startRequest(plan, 'esewa', null);
    expect(first.path).toBe('/consultation-subscriptions/payments/esewa/initiate');
    expect(first.body).toMatchObject({ subscriptionId: 'pl1', serverDelivery: true });
    expect(first.body).not.toHaveProperty('countryCode');
    expect(first.body.purchaseOrderId).toMatch(/^SUB_/);
    expect(startRequest(plan, 'esewa', null).body.purchaseOrderId).not.toBe(
      first.body.purchaseOrderId,
    );
    expect(startRequest(plan, 'card', 'US')).toEqual({
      path: '/subscription/payments/hbl/plans/initiate',
      body: { subscriptionPlanId: 'pl1', countryCode: 'US' },
    });

    const gift: Purchase = { kind: 'gift', giftId: 'g1', astrologerId: 'a1' };
    expect(startRequest(gift, 'fonepay', 'NP')).toEqual({
      path: '/gifts/payments/fonepay/initiate',
      body: { giftId: 'g1', astrologerId: 'a1', countryCode: 'NP', serverDelivery: true },
    });
    expect(startRequest(gift, 'card', 'NP').path).toBe('/subscription/payments/hbl/gifts/initiate');
  });
});

describe('readStarted', () => {
  it('reads redirects, wrapped or not', () => {
    expect(readStarted('esewa', { pidx: 'u1', paymentUrl: 'https://api/pay/u1' })).toEqual({
      pidx: 'u1',
      redirect: 'https://api/pay/u1',
    });
    expect(
      readStarted('esewa', { success: true, data: { pidx: 'u2', payment_url: 'https://api/g' } }),
    ).toEqual({ pidx: 'u2', redirect: 'https://api/g' });
  });

  it('reads the Fonepay QR', () => {
    expect(
      readStarted('fonepay', {
        success: true,
        data: { prn: 'prn1', qrMessage: 'QR', websocketId: 'wss://ws.fonepay/1', terminalId: 't' },
      }),
    ).toEqual({ pidx: 'prn1', qrMessage: 'QR', websocketUrl: 'wss://ws.fonepay/1' });
  });

  it('refuses an answer it cannot use', () => {
    expect(() => readStarted('card', { pidx: 'x' })).toThrow();
    expect(() => readStarted('card', { pidx: 'x', paymentUrl: 'javascript:alert(1)' })).toThrow();
    expect(() => readStarted('fonepay', { prn: 'p' })).toThrow();
  });
});

describe('status', () => {
  it('uses each gateway route', () => {
    expect(statusPath('card', 'o 1')).toBe('/subscription/payments/hbl/status/o%201');
    expect(statusPath('esewa', 'u1')).toBe('/subscription/payments/esewa/purchase/u1');
    expect(statusPath('fonepay', 'p1')).toBe('/subscription/payments/fonepay/purchase/p1');
  });

  it('turns the verdict into what to show', () => {
    const s = (status: string, fulfilment: string | null = null) =>
      outcomeOf(
        readStatus({
          pidx: 'x',
          status,
          purpose: 'package',
          fulfilment: fulfilment ? { status: fulfilment, resultId: 'b1' } : null,
        }),
      );
    expect(s('Completed', 'done')).toBe('done');
    expect(s('Completed', 'running')).toBe('processing');
    expect(s('Completed')).toBe('processing');
    expect(s('Completed', 'failed')).toBe('deliveryFailed');
    expect(s('User canceled')).toBe('notPaid');
    expect(s('Expired')).toBe('notPaid');
    expect(s('Pending')).toBe('waiting');
    expect(s('Initiated')).toBe('waiting');
  });

  it('explains a card that did not go through', () => {
    expect(notPaidMessage('insufficient_funds')).toBe('Not enough balance on this card.');
    expect(notPaidMessage('unknown')).toMatch(/cancelled or failed/);
    expect(notPaidMessage(null)).toMatch(/cancelled or failed/);
  });

  it('keeps eSewa and Fonepay to NPR prices', () => {
    expect(localGatewaysTake('NPR')).toBe(true);
    expect(localGatewaysTake('USD')).toBe(false);
  });
});

describe('returnedPayment', () => {
  const q = (s: string) => returnedPayment(new URLSearchParams(s));
  it('finds the payment in every gateway return', () => {
    expect(q('screen=schedule-appointment&type=esewa&transaction_uuid=abc-123')).toEqual({
      pidx: 'abc-123',
      gateway: 'esewa',
    });
    expect(q('screen=astro-connect%2Fastrologer-profile%2Fa1&status=Completed&pidx=uuid_1')).toEqual(
      { pidx: 'uuid_1', gateway: 'esewa' },
    );
    expect(q('type=hbl&outcome=success&pidx=17918934071472270')).toEqual({
      pidx: '17918934071472270',
      gateway: 'card',
    });
    expect(q('type=fonepay&pidx=PRN123')).toEqual({ pidx: 'PRN123', gateway: 'fonepay' });
  });

  it('ignores junk', () => {
    expect(q('')).toBeNull();
    expect(q('pidx=../../admin')).toBeNull();
  });
});

describe('bankAppLink', () => {
  const bank = {
    bankName: 'ADBL',
    packageName: 'com.f1soft.banksmart.adbl',
    intentScheme: 'adblfonepay://payment/',
  };
  it('opens the bank app by package on Android, by scheme elsewhere', () => {
    expect(bankAppLink(bank, 'a b', true)).toBe(
      'intent://payment/?qrPayload=a%20b#Intent;scheme=adblfonepay;package=com.f1soft.banksmart.adbl;end',
    );
    expect(bankAppLink(bank, 'a b', false)).toBe('adblfonepay://payment/?qrPayload=a%20b');
  });
  it('skips a bank without a usable scheme', () => {
    expect(bankAppLink({ ...bank, intentScheme: 'not a scheme' }, 'x', false)).toBeNull();
  });
});

describe('parsePending', () => {
  const now = Date.parse('2026-11-08T10:00:00Z');
  const row = {
    pidx: 'u1',
    gateway: 'esewa',
    kind: 'gift',
    astrologerId: 'a1',
    title: 'Rose',
    backHref: '/astrologer-profile/a1',
    startedAt: now - 1000,
  };
  it('keeps recent, well-formed rows only', () => {
    expect(
      parsePending(
        JSON.stringify([
          row,
          { ...row, pidx: 'old', startedAt: now - 8 * 24 * 3600 * 1000 },
          { ...row, pidx: 'evil', backHref: '//evil.example' },
          { ...row, pidx: 'bad', gateway: 'khalti' },
          'junk',
        ]),
        now,
      ).map(p => p.pidx),
    ).toEqual(['u1']);
    expect(parsePending('{not json', now)).toEqual([]);
    expect(parsePending(null, now)).toEqual([]);
  });
});

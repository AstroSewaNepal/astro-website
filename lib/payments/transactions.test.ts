import { describe, expect, it } from 'vitest';

import {
  nextTransactionsPage,
  transactionView,
  transactionsPath,
  type Transaction,
} from './transactions';

describe('transactionsPath', () => {
  it('sends only the filters in use', () => {
    expect(transactionsPath({ page: 1, type: 'all', search: '', from: '', to: '' })).toBe(
      '/transactions?page=1&limit=15',
    );
    expect(
      transactionsPath({ page: 2, type: 'gift', search: 'rose', from: '2026-11-01', to: '2026-11-08' }),
    ).toBe('/transactions?page=2&limit=15&type=gift&search=rose&startDate=2026-11-01&endDate=2026-11-08');
  });

  it('pages until the total is reached', () => {
    expect(nextTransactionsPage({ transactions: [], total: 31, page: 2, limit: 15 })).toBe(3);
    expect(nextTransactionsPage({ transactions: [], total: 30, page: 2, limit: 15 })).toBeUndefined();
    expect(nextTransactionsPage(null)).toBeUndefined();
  });
});

describe('transactionView', () => {
  const at = '2026-11-08T04:30:00.000Z';
  it('shows a consultation like the app card', () => {
    const t: Transaction = {
      id: '1',
      type: 'consultation',
      paymentMethod: 'hbl',
      createdAt: at,
      consultation: {
        astrologerName: 'Rowisee',
        packageType: 'Basic',
        consultationMinutes: 15,
        scheduledStartAt: '2026-11-09T04:30:00.000Z',
        status: 'CONFIRMED',
        amount: 549.4,
        currency: 'NPR',
      },
    };
    expect(transactionView(t)).toMatchObject({
      kindLabel: 'Consultation',
      methodLabel: 'Card',
      title: 'Rowisee',
      subtitle: 'Basic · 15 min',
      amount: 'NPR 549',
      at: '2026-11-09T04:30:00.000Z',
      status: { key: 'CONFIRMED', label: 'Confirmed' },
    });
  });

  it('adds up a remedy order with its delivery charge', () => {
    const t: Transaction = {
      id: '2',
      type: 'remedy',
      paymentMethod: 'esewa',
      createdAt: at,
      remedy: {
        trackingNumber: 'TRK-1',
        status: 'in_transit',
        items: [
          { name: 'Rudraksha', currency: 'NPR', discountedPrice: 500, quantity: 2 },
          { name: 'Yantra', currency: 'NPR', discountedPrice: 250, quantity: 1 },
        ],
        totalDeliveryCharge: 100,
      },
    };
    expect(transactionView(t)).toMatchObject({
      title: 'Rudraksha, Yantra',
      amount: 'NPR 1350',
      status: { label: 'In Transit' },
    });
  });

  it('shows gifts and live calls, and skips rows it cannot show', () => {
    expect(
      transactionView({
        id: '3',
        type: 'gift',
        paymentMethod: 'fonepay',
        createdAt: at,
        gift: { giftTitle: 'Rose', astrologerName: 'Rehan', amount: 50, currency: 'NPR' },
      }),
    ).toMatchObject({ title: 'Rose', subtitle: 'To Rehan', amount: 'NPR 50.00', methodLabel: 'Fonepay' });
    expect(
      transactionView({
        id: '4',
        type: 'live',
        paymentMethod: 'esewa',
        createdAt: at,
        live: { astrologerName: 'Rehan', callType: 'private_audio', amount: 300, currency: 'NPR' },
      }),
    ).toMatchObject({ subtitle: 'Private Audio Call', at });
    expect(
      transactionView({
        id: '6',
        type: 'gift',
        paymentMethod: 'khalti',
        createdAt: at,
        gift: { giftTitle: 'Hello', amount: 0, currency: 'NPR' },
      }),
    ).toMatchObject({ methodLabel: 'Free', amount: 'Free' });
    expect(transactionView({ id: '5', type: 'gift', paymentMethod: 'esewa', createdAt: at })).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import {
  cartCount,
  cartTotals,
  checkoutDetails,
  checkoutErrors,
  groupByDelivery,
  hasPlatformItem,
  orderDeliveryType,
  physicalBlocked,
  physicalZone,
  removedBySeller,
  type CartItem,
  type CheckoutForm,
} from './cart';

const item = (over: Partial<CartItem>): CartItem => ({
  id: 'i1',
  remedyId: 'r1',
  name: 'Mala',
  currency: 'NPR',
  price: 1000,
  discountedPrice: 800,
  discount: 20,
  quantity: 1,
  deliveryType: 'physical',
  deliveryZone: 'inside_valley',
  deliveryCharge: 100,
  convertedPrice: 800,
  displayCurrency: 'NPR',
  astrologerId: 'a1',
  ...over,
});

const form: CheckoutForm = {
  shippingAddress: ' Lakeside ',
  onsiteAddress: '',
  onsiteDate: '',
  onsiteTime: '',
  countryCode: '+977',
  phone: '9800000000',
};

describe('cart totals', () => {
  it("adds every physical line's delivery charge, as the server charges", () => {
    const items = [
      item({ id: 'a', quantity: 2 }),
      item({ id: 'b', discountedPrice: 300, convertedPrice: 300, deliveryCharge: 150 }),
      item({
        id: 'c',
        deliveryType: 'online',
        deliveryCharge: 999,
        discountedPrice: 50,
        convertedPrice: 50,
      }),
    ];
    expect(cartTotals(items)).toEqual({
      currency: 'NPR',
      items: 1950,
      delivery: 250,
      total: 2200,
      mixedCurrency: false,
    });
    expect(cartCount({ id: 'x', userId: 'u', items })).toBe(4);
    expect(cartCount(undefined)).toBe(0);
  });

  it('handles cents and spots mixed currencies', () => {
    const t = cartTotals([
      item({
        id: 'a',
        deliveryType: 'online',
        convertedPrice: 0.1,
        displayCurrency: 'USD',
        currency: 'USD',
        quantity: 3,
      }),
      item({
        id: 'b',
        deliveryType: 'online',
        convertedPrice: 0.2,
        displayCurrency: 'USD',
        currency: 'USD',
      }),
    ]);
    expect(t.total).toBe(0.5);
    expect(t.currency).toBe('USD');
    expect(
      cartTotals([item({ id: 'a' }), item({ id: 'b', displayCurrency: 'USD' })]).mixedCurrency,
    ).toBe(true);
  });
});

describe('delivery groups', () => {
  it('groups by delivery type and picks the order type like the app', () => {
    const groups = groupByDelivery([
      item({ id: 'p' }),
      item({ id: 'o', deliveryType: 'online_digital' }),
      item({ id: 's', deliveryType: 'onsite' }),
      item({ id: 'u', deliveryType: '' }),
    ]);
    expect(groups.physical.map(i => i.id)).toEqual(['p']);
    expect(groups.online.map(i => i.id)).toEqual(['o', 'u']);
    expect(groups.onsite.map(i => i.id)).toEqual(['s']);
    expect(orderDeliveryType(groups)).toBe('physical');
    expect(orderDeliveryType({ ...groups, physical: [] })).toBe('onsite');
    expect(orderDeliveryType({ physical: [], onsite: [], online: groups.online })).toBe(
      'online_digital',
    );
    expect(physicalZone(groupByDelivery([item({ deliveryZone: 'outside_valley' })]))).toBe(
      'outside_valley',
    );
    expect(physicalZone(groupByDelivery([]))).toBe('inside_valley');
  });

  it('blocks physical items priced outside NPR', () => {
    const usd = [item({ displayCurrency: 'USD', currency: 'USD' })];
    expect(physicalBlocked(groupByDelivery(usd), cartTotals(usd))).toBe(true);
    const npr = [item({})];
    expect(physicalBlocked(groupByDelivery(npr), cartTotals(npr))).toBe(false);
  });

  it('spots platform-owned remedies', () => {
    expect(hasPlatformItem([item({})])).toBe(false);
    expect(hasPlatformItem([item({}), item({ id: 'x', astrologerId: null })])).toBe(true);
  });
});

describe('checkout form', () => {
  it('requires what the cart needs', () => {
    const groups = groupByDelivery([item({}), item({ id: 's', deliveryType: 'onsite' })]);
    expect(checkoutErrors({ ...form, shippingAddress: ' ', phone: '98' }, groups)).toEqual({
      shippingAddress: 'Shipping address is required',
      onsiteAddress: 'Onsite address is required',
      onsiteDate: 'Please choose a date',
      onsiteTime: 'Please choose a time',
      phone: 'Phone number must be 10 digits',
    });
    expect(checkoutErrors(form, groupByDelivery([item({})]))).toEqual({});
    expect(checkoutErrors({ ...form, countryCode: '977' }, groupByDelivery([]))).toEqual({
      countryCode: 'Invalid country code',
    });
  });

  it('sends only the fields this cart needs', () => {
    expect(checkoutDetails(form, groupByDelivery([item({})]), null)).toEqual({
      deliveryType: 'physical',
      shippingAddress: 'Lakeside',
    });
    expect(
      checkoutDetails(
        { ...form, onsiteAddress: 'Home', onsiteDate: '2026-12-01', onsiteTime: '10:30' },
        groupByDelivery([item({ deliveryType: 'onsite' })]),
        'c1',
      ),
    ).toEqual({
      deliveryType: 'onsite',
      onsiteAddress: 'Home',
      onsiteDate: '2026-12-01',
      onsiteTime: '10:30',
      consultationId: 'c1',
    });
  });

  it('finds the lines the seller removed', () => {
    const before = [item({ id: 'a' }), item({ id: 'b' })];
    expect(removedBySeller(before, [item({ id: 'b' })]).map(i => i.id)).toEqual(['a']);
  });
});

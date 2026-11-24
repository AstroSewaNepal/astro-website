// The remedy cart and its checkout (doc 11), as the app's Cart screen (ap src/screens/Cart), which is also where
// the app pays. The cart lives on the server (GET/POST/PATCH/DELETE /cart...), priced in the buyer's currency when
// an item is added; the server charges Σ price × quantity plus each physical line's delivery charge.
// Paying goes through lib/payments/checkout (Purchase kind 'remedy').

export type DeliveryZone = 'inside_valley' | 'outside_valley' | 'out_of_country';

export const ZONE_OPTIONS: { value: DeliveryZone; label: string }[] = [
  { value: 'inside_valley', label: 'Inside Valley' },
  { value: 'outside_valley', label: 'Outside Valley' },
  { value: 'out_of_country', label: 'Out of Country' },
];

/** New physical items go in with this zone (the app's useRemedyCart); the cart can change it. */
export const DEFAULT_ZONE: DeliveryZone = 'inside_valley';

export type CartItem = {
  id: string;
  remedyId: string;
  name: string;
  /** The currency the buyer is charged in. */
  currency: string;
  price: number;
  /** What one unit costs the buyer, in `currency`. */
  discountedPrice: number;
  discount: number;
  quantity: number;
  deliveryType: string;
  deliveryZone: DeliveryZone | null;
  /** NPR, charged once per physical line. */
  deliveryCharge: number;
  imageUrl?: string | null;
  convertedPrice?: number | null;
  displayCurrency?: string | null;
  /** null = a platform-owned remedy (the buyer may say which astrologer recommended it). */
  astrologerId?: string | null;
};

export type Cart = { id: string; userId: string; items: CartItem[] };

export const CART_QUERY_KEY = ['remedies', 'cart'] as const;

export function cartItems(cart: Cart | null | undefined): CartItem[] {
  return Array.isArray(cart?.items) ? cart.items : [];
}

/** The badge number: units, as the app's useCart (Σ quantity). */
export function cartCount(cart: Cart | null | undefined): number {
  return cartItems(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

export function unitPrice(item: CartItem): number {
  return item.convertedPrice ?? item.discountedPrice;
}

export function itemCurrency(item: CartItem): string {
  return item.displayCurrency ?? item.currency ?? 'NPR';
}

export type CartGroups = { physical: CartItem[]; online: CartItem[]; onsite: CartItem[] };

/** Online covers online, online_digital and anything unknown, as the app. */
export function groupByDelivery(items: CartItem[]): CartGroups {
  const groups: CartGroups = { physical: [], online: [], onsite: [] };
  for (const item of items) {
    if (item.deliveryType === 'physical') groups.physical.push(item);
    else if (item.deliveryType === 'onsite') groups.onsite.push(item);
    else groups.online.push(item);
  }
  return groups;
}

/** The order's delivery type: physical if any, else onsite if any, else online (the app's rule). */
export function orderDeliveryType(groups: CartGroups): 'physical' | 'onsite' | 'online_digital' {
  if (groups.physical.length) return 'physical';
  if (groups.onsite.length) return 'onsite';
  return 'online_digital';
}

export type CartTotals = {
  currency: string;
  items: number;
  delivery: number;
  total: number;
  /** More than one currency in the cart: the server refuses to charge it. */
  mixedCurrency: boolean;
};

/**
 * What the server will charge (remedy payment services): Σ unit × quantity + Σ physical lines' delivery charges.
 * The app shows only the first physical line's charge; the server adds each line's, so this does too.
 */
export function cartTotals(items: CartItem[]): CartTotals {
  const currencies = new Set(items.map(itemCurrency));
  const sumItems = items.reduce(
    (sum, item) => sum + Math.round(unitPrice(item) * 100) * item.quantity,
    0,
  );
  const delivery = items
    .filter(item => item.deliveryType === 'physical' && item.deliveryCharge > 0)
    .reduce((sum, item) => sum + Math.round(item.deliveryCharge * 100), 0);
  return {
    currency: items[0] ? itemCurrency(items[0]) : 'NPR',
    items: sumItems / 100,
    delivery: delivery / 100,
    total: (sumItems + delivery) / 100,
    mixedCurrency: currencies.size > 1,
  };
}

/** The zone the physical lines use (they all share one; the first decides, as the app). */
export function physicalZone(groups: CartGroups): DeliveryZone {
  return groups.physical[0]?.deliveryZone ?? DEFAULT_ZONE;
}

/**
 * Physical products can only be paid in NPR (eSewa/Fonepay take NPR only, and the card route refuses physical
 * items in another currency), so a buyer priced in $ or ₹ can't check out a physical item.
 */
export function physicalBlocked(groups: CartGroups, totals: CartTotals): boolean {
  return groups.physical.length > 0 && totals.currency !== 'NPR';
}

/** The cart has a platform-owned remedy: the buyer may name the astrologer who recommended it. */
export function hasPlatformItem(items: CartItem[]): boolean {
  return items.some(item => !item.astrologerId);
}

export type CheckoutForm = {
  shippingAddress: string;
  onsiteAddress: string;
  /** YYYY-MM-DD */
  onsiteDate: string;
  /** HH:mm */
  onsiteTime: string;
  countryCode: string;
  phone: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

/** The app's checkout rules (Cart zod schema). */
export function checkoutErrors(form: CheckoutForm, groups: CartGroups): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (groups.physical.length && !form.shippingAddress.trim()) {
    errors.shippingAddress = 'Shipping address is required';
  }
  if (groups.onsite.length) {
    if (!form.onsiteAddress.trim()) errors.onsiteAddress = 'Onsite address is required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.onsiteDate)) errors.onsiteDate = 'Please choose a date';
    if (!/^\d{2}:\d{2}$/.test(form.onsiteTime)) errors.onsiteTime = 'Please choose a time';
  }
  if (!/^\+\d{1,4}$/.test(form.countryCode)) errors.countryCode = 'Invalid country code';
  if (!/^\d{10}$/.test(form.phone)) errors.phone = 'Phone number must be 10 digits';
  return errors;
}

export type RemedyCheckout = {
  deliveryType: 'physical' | 'onsite' | 'online_digital';
  shippingAddress?: string;
  onsiteAddress?: string;
  onsiteDate?: string;
  onsiteTime?: string;
  consultationId?: string;
};

/** The delivery details the server keeps for the order (only the fields this cart needs). */
export function checkoutDetails(
  form: CheckoutForm,
  groups: CartGroups,
  consultationId: string | null,
): RemedyCheckout {
  const details: RemedyCheckout = { deliveryType: orderDeliveryType(groups) };
  if (groups.physical.length) details.shippingAddress = form.shippingAddress.trim();
  if (groups.onsite.length) {
    details.onsiteAddress = form.onsiteAddress.trim();
    details.onsiteDate = form.onsiteDate;
    details.onsiteTime = form.onsiteTime;
  }
  if (consultationId) details.consultationId = consultationId;
  return details;
}

/** "Cart Updated by Seller": items in the cart before paying that the server no longer has. */
export function removedBySeller(before: CartItem[], now: CartItem[]): CartItem[] {
  const ids = new Set(now.map(item => item.id));
  return before.filter(item => !ids.has(item.id));
}

export type AttributionOption = {
  consultationId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerPhotoUrl: string | null;
  scheduledStartAt: string;
  status: string;
  packageType: string | null;
};

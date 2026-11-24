// Remedies shop (doc 11): the app's Remedies tab, category list and product page (ap src/screens/Remedies).
// Categories and products are public on the backend; prices come back in the buyer's currency when the country
// code is sent (`convertedPrice` + `displayCurrency`), otherwise in NPR.

export type RemedyDeliveryType = 'physical' | 'online' | 'online_digital' | 'onsite';

export type RemedyCategory = {
  _id: string;
  title: string;
  description?: string | null;
  image?: { mediaId?: string; url?: string | null } | null;
};

export type RemedyMedia = { mediaId: string; url: string; order: number; isDefault: boolean };

export type Remedy = {
  id: string;
  astrologer?: { astrologerId: string; astrologerName: string } | null;
  name: string;
  subtitle?: string | null;
  category?: { categoryId: string; title: string } | null;
  subcategory?: string[] | null;
  /** Rich text: TipTap JSON, `{ html }` or a plain HTML string (see description.ts). */
  description?: unknown;
  prices: { npr: number; inr: number; usd: number };
  /** Percent off. */
  discount: number;
  /** NPR after discount (used when there is no converted price). */
  discountedPrice: number;
  stock: number;
  isActive: boolean;
  deliveryType: RemedyDeliveryType | string;
  media: RemedyMedia[];
  convertedPrice?: number | null;
  displayCurrency?: string | null;
};

export const PAGE_LIMIT = 10;

export const REMEDIES_PATH = '/remedies';
export const CART_PATH = '/client/cart';
/** The app's "Orders": My Payments filtered to remedies. */
export const ORDERS_PATH = '/client/payments?type=remedy';

/** The product page. Also the link the app shares (`${webUrl}/remedy/${id}`). */
export function remedyPath(id: string): string {
  return `/remedy/${encodeURIComponent(id)}`;
}

export function categoryPath(categoryId: string): string {
  return `${REMEDIES_PATH}/${encodeURIComponent(categoryId)}`;
}

export function remediesListPath(
  page: number,
  categoryId: string | null,
  countryCode: string | null,
) {
  const q = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
  if (categoryId) q.set('category', categoryId);
  if (countryCode) q.set('countryCode', countryCode);
  return `/astrologers/remedies?${q}`;
}

export function remedyDetailPath(id: string, countryCode: string | null) {
  const q = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : '';
  return `/astrologers/remedies/${encodeURIComponent(id)}${q}`;
}

/** The next page while `page*limit < total` and the last page came back full, as the app. */
export function nextRemediesPage(
  pagination: { page?: number; limit?: number; total?: number } | undefined,
  received: number,
): number | undefined {
  const page = Number(pagination?.page);
  const limit = Number(pagination?.limit);
  const total = Number(pagination?.total);
  if (!page || !limit || !Number.isFinite(total) || received < limit) return undefined;
  return page * limit < total ? page + 1 : undefined;
}

export type RemedyPrice = {
  currency: string;
  /** What the buyer pays. */
  value: number;
  /** Full price before the discount (null when there is no discount). */
  full: number | null;
};

/** The price shown on cards and the product page, as the app (struck price = price / (1 - discount)). */
export function remedyPrice(
  remedy: Pick<
    Remedy,
    'convertedPrice' | 'displayCurrency' | 'discountedPrice' | 'discount' | 'prices'
  >,
): RemedyPrice {
  const converted = typeof remedy.convertedPrice === 'number';
  const value = converted ? (remedy.convertedPrice as number) : remedy.discountedPrice;
  const currency = (converted && remedy.displayCurrency) || 'NPR';
  let full: number | null = null;
  if (remedy.discount > 0 && remedy.discount < 100) {
    full = converted ? Math.round(value / (1 - remedy.discount / 100)) : remedy.prices.npr;
  }
  return { currency, value, full: full !== null && full !== value ? full : null };
}

const SYMBOLS: Record<string, string> = { NPR: 'NPR', INR: '₹', USD: '$' };

/** "NPR 500", "$ 5", "₹ 40" (as the app's package prices; the app's remedy cards print the code). */
export function moneyLabel(currency: string, value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${SYMBOLS[currency] ?? currency} ${rounded.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/** The default image, else the first. */
export function coverImage(media: RemedyMedia[] | null | undefined): string | null {
  const list = Array.isArray(media) ? media : [];
  return (list.find(m => m.isDefault) ?? list[0])?.url ?? null;
}

export function sortedMedia(media: RemedyMedia[] | null | undefined): RemedyMedia[] {
  return [...(Array.isArray(media) ? media : [])]
    .filter(m => !!m.url)
    .sort((a, b) => a.order - b.order);
}

export function deliveryLabel(type: string): string {
  switch (type) {
    case 'physical':
      return 'Physical Delivery';
    case 'online':
    case 'online_digital':
      return 'Online Delivery';
    case 'onsite':
      return 'Onsite Delivery';
    default:
      return 'Delivery';
  }
}

/** The app filters the loaded pages by name or category title, and by expertise tag against `subcategory`. */
export function matchesRemedy(remedy: Remedy, search: string, tag: string | null): boolean {
  const q = search.trim().toLowerCase();
  const bySearch =
    !q ||
    remedy.name.toLowerCase().includes(q) ||
    (remedy.category?.title ?? '').toLowerCase().includes(q);
  const byTag = !tag || (remedy.subcategory ?? []).some(s => s.toLowerCase() === tag.toLowerCase());
  return bySearch && byTag;
}

export function matchesCategory(category: RemedyCategory, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    category.title.toLowerCase().includes(q) ||
    (category.description ?? '').toLowerCase().includes(q)
  );
}

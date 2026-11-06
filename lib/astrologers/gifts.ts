// Gifts on an astrologer's profile, as the app's GiftsSection / GiftSendSheet (ap src/screens/AstroConnect).

/** GET /gifts?countryCode= items. `displayPrice` / `displayCurrency` are already for the buyer's country. */
export type Gift = {
  _id: string;
  title: string;
  image?: { mediaId?: string; url?: string } | null;
  prices: { npr: number; inr: number; usd: number };
  displayPrice?: number;
  displayCurrency?: string;
  isActive?: boolean;
};

export function isGiftFree(gift: Pick<Gift, 'displayPrice' | 'prices'>): boolean {
  if (gift.displayPrice !== undefined) return gift.displayPrice === 0;
  return gift.prices.npr === 0 && gift.prices.inr === 0 && gift.prices.usd === 0;
}

const SYMBOLS: Record<string, string> = { INR: '₹', USD: '$' };

/** "Free", "NPR 50.00", "₹ 40.00", "$ 10.00", like the app. */
export function giftPriceLabel(gift: Gift): string {
  if (isGiftFree(gift)) return 'Free';
  const currency = gift.displayCurrency ?? 'NPR';
  const amount = gift.displayPrice ?? gift.prices.npr;
  return `${SYMBOLS[currency] ?? currency} ${amount.toFixed(2)}`;
}

/**
 * Gifts the profile offers. The app hides paid gifts on iPhones (App Store rule 3.1.1: digital goods need In-App
 * Purchase); that rule doesn't cover a website, so the web offers every active gift on every device.
 */
export function availableGifts(gifts: Gift[] | null | undefined): Gift[] {
  return (gifts ?? []).filter(g => g && g._id && g.title && g.isActive !== false);
}

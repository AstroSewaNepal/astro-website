// Consultation packages and subscription plans, as the app's ConsultationPackagesScreen (ap src/screens/ConsultationPackages).

export type Price = { currency: string; value: number };

/** GET /astrologers/:id/packages items: `cost` / `discountedPrice` are already for the requested country. */
export type ConsultationPackage = {
  id: string;
  packageType: string;
  consultationMinutes: number;
  cost?: Price | null;
  discountedPrice?: Price | null;
  discountPercent?: number;
  included?: string[];
  excluded?: string[];
};

/** GET /astrologers/:id/subscription-plans items. */
export type SubscriptionPlan = {
  id: string;
  durationMonths: number;
  consultationMinutes: number;
  totalConsultations: number;
  cost?: Price | null;
  discountedPrice?: Price | null;
  discountPercent?: number;
  included?: string[];
  excluded?: string[];
};

export type PackagesResponse = { astrologerId: string; packages: ConsultationPackage[] };
export type PlansResponse = { astrologerId: string; subscriptionPlans: SubscriptionPlan[] };

export type PackageTab = 'perSession' | 'subscription';

const profileBase = (astrologerId: string) =>
  `/astrologer-profile/${encodeURIComponent(astrologerId)}`;

/** The app's /consultation-packages?astrologerId=, under the profile it's opened from. */
export function packagesPath(astrologerId: string, tab: PackageTab = 'perSession'): string {
  return `${profileBase(astrologerId)}/packages${tab === 'subscription' ? '?tab=subscription' : ''}`;
}

/** Schedule appointment for one package. Only the id travels: the page reads the price from the backend again. */
export function schedulePath(astrologerId: string, packageId: string): string {
  return `${profileBase(astrologerId)}/schedule?package=${encodeURIComponent(packageId)}`;
}

/** `?tab=subscription` opens the plans, like the app's initialTab (My Consultations' "book again" on a plan). */
export function packageTab(value: string | string[] | undefined | null): PackageTab {
  return value === 'subscription' ? 'subscription' : 'perSession';
}

const TYPE_ORDER: Record<string, number> = { Basic: 0, Standard: 1, Premium: 2, Unlimited: 3 };

/** Basic, Standard, Premium, Unlimited, then any other type by name (the app's PACKAGE_TYPE_SORT_ORDER). */
export function sortPackages(packages: ConsultationPackage[]): ConsultationPackage[] {
  return [...packages].sort((a, b) => {
    const order =
      (TYPE_ORDER[a.packageType] ?? Number.MAX_SAFE_INTEGER) -
      (TYPE_ORDER[b.packageType] ?? Number.MAX_SAFE_INTEGER);
    return order || a.packageType.localeCompare(b.packageType);
  });
}

/** "15 min", "1 hour", "1 hour 30 min", "2 hours" (the app's formatDuration). */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = `${hours} hour${hours > 1 ? 's' : ''}`;
  return rest === 0 ? h : `${h} ${rest} min`;
}

const PLAN_LABELS: Record<number, string> = {
  1: '1 Month',
  3: '3 Months',
  6: '6 Months',
  12: '12 Months',
};

export function planLabel(durationMonths: number): string {
  return PLAN_LABELS[durationMonths] ?? `${durationMonths} Months`;
}

const SYMBOLS: Record<string, string> = { EUR: '€', INR: '₹', NPR: 'NPR' };

/** The app's package cards: "NPR 393.3", "₹ 40", "$ 5" (any other currency shows as $, like the app). */
export function priceLabel(price: Price): string {
  return `${SYMBOLS[price.currency] ?? '$'} ${price.value}`;
}

/** What the buyer pays, the full price, and whether the full price is shown struck through. */
export function priceParts(item: Pick<ConsultationPackage, 'cost' | 'discountedPrice'>): {
  pay: Price | null;
  full: Price | null;
  struck: boolean;
  free: boolean;
} {
  const pay = item.discountedPrice ?? item.cost ?? null;
  const full = item.cost ?? null;
  return {
    pay,
    full,
    struck: !!pay && !!full && full.value !== pay.value,
    free: pay?.value === 0,
  };
}

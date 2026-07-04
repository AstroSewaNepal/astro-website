import type { Astrologer, AstrologerPackage } from './types';

const MAX_LANGUAGES = 3;
const MAX_SPECIALIZATIONS = 3;
const MAX_SERVICES = 2;
const TOP_ASTROLOGER_LIMIT = 10;

export function getLowestPackage(packages?: AstrologerPackage[] | null): AstrologerPackage | null {
  if (!packages?.length) return null;

  return [...packages].sort(
    (a, b) =>
      (a.discountedPrice?.value ?? Number.POSITIVE_INFINITY) -
      (b.discountedPrice?.value ?? Number.POSITIVE_INFINITY),
  )[0];
}

export function formatCurrency(currency?: string | null, value?: number | null): string {
  if (value == null || Number.isNaN(value)) return 'Price unavailable';
  const code = currency?.trim() || 'NPR';
  return `${code} ${value}`;
}

export function getDisplayLanguages(languages?: string[] | null): string {
  const list = (languages ?? []).map(item => item.trim()).filter(Boolean);
  if (!list.length) return 'Languages unavailable';

  const shown = list.slice(0, MAX_LANGUAGES);
  const remaining = list.length - shown.length;
  return remaining > 0 ? `${shown.join(', ')} +${remaining} more` : shown.join(', ');
}

export function getDisplaySpecializations(services?: string[] | null): string {
  const list = (services ?? []).map(item => item.trim()).filter(Boolean);
  if (!list.length) return 'Specialization unavailable';

  return list.slice(0, MAX_SPECIALIZATIONS).join(', ');
}

export function getDisplayServices(services?: string[] | null): string {
  const list = (services ?? []).map(item => item.trim()).filter(Boolean);
  if (!list.length) return 'Services unavailable';

  return list.slice(0, MAX_SERVICES).join(', ');
}

export function getDisplayExpertise(
  expertise?: string[] | null,
  specialist?: string[] | null,
): string {
  const list = [...(expertise ?? []), ...(specialist ?? [])]
    .map(item => item.trim())
    .filter(Boolean);
  if (!list.length) return 'Expertise unavailable';

  return Array.from(new Set(list)).slice(0, MAX_SPECIALIZATIONS).join(', ');
}

export function getRatingStars(rating?: number | null): {
  filled: number;
  empty: number;
  hasRating: boolean;
} {
  if (rating == null || Number.isNaN(rating) || rating <= 0) {
    return { filled: 0, empty: 5, hasRating: false };
  }

  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return { filled, empty: 5 - filled, hasRating: true };
}

export function getProfileImageUrl(astrologer: Astrologer): string | null {
  return (
    astrologer.user?.profilePicture?.thumbnail?.url?.trim() ||
    astrologer.user?.profilePicture?.url?.trim() ||
    null
  );
}

export function getAstrologerName(astrologer: Astrologer): string {
  return astrologer.user?.fullName?.trim() || 'Astrologer';
}

export function isAstrologerOnline(astrologer: Astrologer): boolean {
  return astrologer.status === 'ONLINE';
}

export function sortTopAstrologers(astrologers: Astrologer[]): Astrologer[] {
  return [...astrologers]
    .sort((a, b) => {
      const activeDiff =
        Number(Boolean(b.isAstrologerActive)) - Number(Boolean(a.isAstrologerActive));
      if (activeDiff !== 0) return activeDiff;

      const ratingDiff = (b.averageRating ?? 0) - (a.averageRating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;

      return (b.totalBookings ?? 0) - (a.totalBookings ?? 0);
    })
    .slice(0, TOP_ASTROLOGER_LIMIT);
}

export function getExperienceLabel(years?: number | null): string {
  if (years == null || Number.isNaN(years) || years <= 0) {
    return 'Experience unavailable';
  }

  const rounded = Number.isInteger(years) ? years : Number(years.toFixed(1));
  return `${rounded} Years Experience`;
}

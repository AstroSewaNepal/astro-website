// Astrologer profile, as the app's AstrologerDetailScreen: the shapes it reads and the small rules behind its sections.

/** GET /ratings/astrologer/:id/review-ratings items. */
export type RatingReview = {
  reviewId: string;
  user: {
    _id?: string;
    name?: string | null;
    profilePicture?: string | null;
    hideProfile?: boolean;
  };
  ratingMessage?: string | null;
  overallRating: number;
  topicRatings?: { topicName: string; rating: number }[];
  createdAt?: string;
};

export type TopicAverage = { topic: string; rating: number };

/** Average of the reviews' overall ratings (0 when there are none). */
export function averageRating(reviews: RatingReview[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / reviews.length;
}

/**
 * Average per topic, in first-seen order. The app divides each topic score by the number of reviews, so a topic that
 * appears twice in one review (seen on test: "Accuracy" twice) goes above 5; here it is a plain mean per topic.
 */
export function topicAverages(reviews: RatingReview[]): TopicAverage[] {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    for (const { topicName, rating } of review.topicRatings ?? []) {
      if (!topicName || typeof rating !== 'number') continue;
      const t = totals.get(topicName) ?? { sum: 0, count: 0 };
      t.sum += rating;
      t.count += 1;
      totals.set(topicName, t);
    }
  }
  return [...totals].map(([topic, t]) => ({ topic, rating: t.sum / t.count }));
}

/** The app hides the day and month of a private reviewer's review: "**-**-2026". */
export function reviewDate(review: RatingReview): string {
  const date = review.createdAt ? new Date(review.createdAt) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  if (review.user?.hideProfile) return `**-**-${date.getFullYear()}`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Tier names are free text set by admins (TOP_CHOICE, "TOP RATED"...): show them as words. */
export function tierLabel(name: string | null | undefined): string | null {
  const words = name
    ?.trim()
    .replace(/[_\s]+/g, ' ')
    .toLowerCase();
  if (!words) return null;
  return words.replace(/\b\w/g, c => c.toUpperCase());
}

/** The app's badge colours for the known tiers; any other tier uses the Top Choice look. */
export function tierStyle(name: string | null | undefined): { bg: string; text: string } {
  const key = name?.trim().toUpperCase().replace(/\s+/g, '_');
  switch (key) {
    case 'RISING_STAR':
      return { bg: '#720A0B', text: '#F8F0DC' };
    case 'TOP_RATED':
      return { bg: '#FFDCB9', text: '#7E3F00' };
    case 'POPULAR':
      return { bg: '#D7E8FF', text: '#002A63' };
    default:
      return { bg: '#FFE8B1', text: '#974F00' };
  }
}

/** Tag names of one type (skill / expertise), as the app's card rows. */
export function tagNames(
  tags: { name?: string | null; type?: string | null }[] | null | undefined,
  type: string,
) {
  return (tags ?? [])
    .filter(t => t.type?.toLowerCase() === type && t.name)
    .map(t => (t.name as string).trim());
}

/** The share link of a profile on this site (the app's own share link points here too, see SHARE-LINKS-CHECKPOINT). */
export const profileShareUrl = (origin: string, astrologerUserId: string) =>
  `${origin.replace(/\/+$/, '')}/astrologer-profile/${encodeURIComponent(astrologerUserId)}`;

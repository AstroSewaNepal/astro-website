export const TIER_TAG_TYPE = 'tier';

/** "RISING_STAR" -> "Rising Star" */
export function formatTierName(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function findTierTag<T extends { type: string }>(
  tags: T[] | undefined | null,
): T | undefined {
  return tags?.find((tag) => tag.type === TIER_TAG_TYPE);
}

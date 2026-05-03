/** In-app routes under `/zodiac-sign`. `sign` is the Vedastro slug (`aries`, `taurus`, …). */
export function zodiacEnglishDetailHref(signSlug: string): string {
  const s = signSlug.trim().toLowerCase();
  const params = new URLSearchParams();
  params.set('sign', s);
  return `/zodiac-sign/details?${params.toString()}`;
}

export function zodiacNepaliDetailHref(signSlug: string): string {
  const s = signSlug.trim().toLowerCase();
  const params = new URLSearchParams();
  params.set('sign', s);
  return `/zodiac-sign/zodiac-detailnepali?${params.toString()}`;
}

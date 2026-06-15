import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

type BlogViewCountsPayload = {
  views?: Record<string, number>;
};

type BlogViewRecordPayload = {
  slug?: string;
  view_count?: number;
};

type BackendResult<T> = {
  success?: boolean;
  data?: T;
};

function getBlogViewsApiRoot(): string | null {
  const base = tryGetPublicBackendBaseUrl();
  return base ? `${base}/blog/views` : null;
}

export async function fetchBlogViewCounts(
  slugs: string[],
): Promise<Record<string, number>> {
  const uniqueSlugs = [...new Set(slugs.map(slug => slug.trim().toLowerCase()).filter(Boolean))];
  if (uniqueSlugs.length === 0) return {};

  const apiRoot = getBlogViewsApiRoot();
  if (!apiRoot) return Object.fromEntries(uniqueSlugs.map(slug => [slug, 0]));

  try {
    const response = await fetch(
      `${apiRoot}?slugs=${encodeURIComponent(uniqueSlugs.join(','))}`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return Object.fromEntries(uniqueSlugs.map(slug => [slug, 0]));

    const body = (await response.json()) as BackendResult<BlogViewCountsPayload>;
    const views = body.data?.views ?? {};
    const out: Record<string, number> = {};
    for (const slug of uniqueSlugs) {
      out[slug] = typeof views[slug] === 'number' ? views[slug] : 0;
    }
    return out;
  } catch {
    return Object.fromEntries(uniqueSlugs.map(slug => [slug, 0]));
  }
}

export async function recordBlogView(slug: string): Promise<number | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const apiRoot = getBlogViewsApiRoot();
  if (!apiRoot) return null;

  try {
    const response = await fetch(`${apiRoot}/${encodeURIComponent(normalized)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const body = (await response.json()) as BackendResult<BlogViewRecordPayload>;
    return typeof body.data?.view_count === 'number' ? body.data.view_count : null;
  } catch {
    return null;
  }
}

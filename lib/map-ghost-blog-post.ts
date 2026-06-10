import {
  estimateReadingTimeMinutes,
  formatReadingDuration,
  formatViewCount,
} from '@/lib/blog-utils';

export type MappedBlogPost = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  date: string;
  author: string;
  duration: string;
  views: string;
  feature: string[];
  tagSlugs: string[];
  link: string;
};

type GhostTag = {
  name?: string;
  slug?: string;
};

type GhostAuthor = {
  name?: string;
};

export type GhostBlogPost = {
  id?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  html?: string | null;
  feature_image?: string | null;
  published_at?: string | null;
  reading_time?: number | null;
  authors?: GhostAuthor[];
  tags?: GhostTag[];
};

export function mapGhostBlogPost(
  post: GhostBlogPost,
  viewCounts: Record<string, number> = {},
): MappedBlogPost {
  const slug = post.slug ?? '';
  const readingMinutes = estimateReadingTimeMinutes({
    reading_time: post.reading_time,
    html: post.html,
    excerpt: post.excerpt,
  });

  return {
    id: post.id ?? '',
    title: post.title ?? '',
    slug,
    description: post.excerpt ?? '',
    image: post.feature_image ?? '',
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
    author: post.authors?.[0]?.name ?? 'Astro Sewa',
    duration: formatReadingDuration(readingMinutes),
    views: formatViewCount(viewCounts[slug] ?? 0),
    feature: post.tags?.map(tag => tag.name ?? '').filter(Boolean) ?? [],
    tagSlugs: post.tags?.map(tag => tag.slug ?? '').filter(Boolean) ?? [],
    link: `/blogs/${slug}`,
  };
}

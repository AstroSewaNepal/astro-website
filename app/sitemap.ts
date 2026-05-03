import type { MetadataRoute } from 'next';
import { ghostClient } from '@/lib/ghostClient';

export const revalidate = 3600; // regenerate every 1 hour

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.astrosewa.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await ghostClient.posts.browse({
      limit: 'all',
      fields: ['slug', 'updated_at'],
    });

    blogEntries = posts.map(post => ({
      url: `${BASE_URL}/blogs/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: failed to fetch Ghost posts', error);
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogEntries,
  ];
}

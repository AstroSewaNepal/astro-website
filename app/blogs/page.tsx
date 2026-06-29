import type { Metadata } from 'next';
import React from 'react';

import { ghostClient } from '@/lib/ghostClient';
import { fetchBlogViewCounts } from '@/lib/blog-view-api';
import { mapGhostBlogPost } from '@/lib/map-ghost-blog-post';

export const metadata: Metadata = {
  title: 'Astrology Blog',
  description:
    'Explore expert astrology articles, Vedic insights, horoscope guides, and spiritual tips on the Astro Sewa blog — written by experienced astrologers in Nepal.',
  keywords: [
    'astrology blog',
    'vedic astrology articles',
    'horoscope guide',
    'Nepal astrology blog',
    'astrology tips',
    'spiritual guidance',
  ],
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'Astrology Blog — Vedic Insights & Horoscope Guides | Astro Sewa',
    description:
      'Read expert astrology articles, Vedic insights, and horoscope guides from verified astrologers on the Astro Sewa blog.',
  },
};
import BlogHeader from '@/components/pages/blogs/header';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

async function getBlogTags() {
  const tags = await ghostClient.tags.browse({
    fields: ['name', 'slug'],
    limit: 'all',
    order: 'name asc',
  });
  return tags.map(t => ({ name: t.name ?? '', slug: t.slug ?? '' })).filter(t => t.name);
}

async function getBlogPosts() {
  const posts = await ghostClient.posts.browse({
    include: ['tags', 'authors'],
    fields: [
      'id',
      'title',
      'slug',
      'excerpt',
      'html',
      'feature_image',
      'published_at',
      'reading_time',
      'primary_tag',
    ],
    limit: 'all',
    order: 'published_at desc',
  });

  const viewCounts = await fetchBlogViewCounts(posts.map(post => post.slug ?? '').filter(Boolean));

  return posts.map(post => mapGhostBlogPost(post, viewCounts));
}

const BlogPage = async () => {
  const [tags, posts] = await Promise.all([getBlogTags(), getBlogPosts()]);
  return (
    <main className="container mx-auto min-h-screen overflow-hidden space-y-[100px] pb-16">
      <div>
        <BlogHeader tags={tags} posts={posts} />
      </div>
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
};

export default BlogPage;

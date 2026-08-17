import type { Metadata } from 'next';
import React from 'react';

import { ghostClient } from '@/lib/ghostClient';
import { fetchBlogViewCounts } from '@/lib/blog-view-api';
import { mapGhostBlogPost } from '@/lib/map-ghost-blog-post';

export const metadata: Metadata = {
  title: 'Vedic Guides, Sign Meanings and Predictions | AstroSewa',
  description:
    'Guides, birth chart breakdowns, Dasha predictions, and zodiac deep dives written by our verified Vedic astrologers. Find your topic and start reading.',
  keywords: [
    'astrology blogs',
    'Vedic astrology guide',
    'birth chart explained',
    'zodiac sign meaning',
    'Dasha periods',
    'astrology prediction',
  ],
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'Vedic Guides, Sign Meanings and Predictions | AstroSewa',
    description:
      'Guides, birth chart breakdowns, Dasha predictions, and zodiac deep dives written by our verified Vedic astrologers. Find your topic and start reading.',
  },
};
import BlogHeader from '@/components/pages/blogs/header';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

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
    <main className="container mx-auto min-h-screen overflow-hidden pb-16">
      <div>
        <BlogHeader tags={tags} posts={posts} />
      </div>
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Clarity />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Services />
      <SectionDivider className="mt-[40px] mb-[10px]" />
      <DownloadApp noBorder />
    </main>
  );
};

export default BlogPage;

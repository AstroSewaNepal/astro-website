import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Puja Bidhi — Hindu Rituals & Worship Guides',
  description:
    'Discover detailed Puja Bidhi (worship procedures) for Hindu rituals and festivals. Step-by-step puja guides, mantras, and spiritual practices from Astro Sewa Nepal.',
  keywords: [
    'puja bidhi',
    'hindu puja procedure',
    'nepali puja',
    'worship guide Nepal',
    'puja mantra',
    'hindu rituals Nepal',
    'vedic puja',
  ],
  alternates: {
    canonical: '/puja-bidhi',
  },
  openGraph: {
    title: 'Puja Bidhi — Hindu Rituals & Worship Guides | Astro Sewa',
    description:
      "Step-by-step Hindu puja procedures, mantras, and ritual guides for Nepal's festivals and daily worship.",
  },
};

// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import PujaBidhiHeader from '@/components/pages/puja-bidhi/header';
import { ghostClient } from '@/lib/ghostClient';
import { fetchBlogViewCounts } from '@/lib/blog-view-api';
import { mapGhostBlogPost } from '@/lib/map-ghost-blog-post';

async function getPujaBidhiPosts() {
  const posts = await ghostClient.posts.browse({
    filter: 'tag:puja-bidhi',
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

  return posts.map(post => ({
    ...mapGhostBlogPost(post, viewCounts),
    link: `/puja-bidhi/${post.slug ?? ''}`,
  }));
}

const PujaBidhiPage = async () => {
  const posts = await getPujaBidhiPosts();

  return (
    <main className="min-h-screen space-y-[100px]">
      <div>
        <PujaBidhiHeader posts={posts} />
      </div>
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <DownloadApp />
    </main>
  );
};

export default PujaBidhiPage;

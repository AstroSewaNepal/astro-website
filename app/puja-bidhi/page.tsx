import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Hindu Puja Guides, Rituals and Mantras | AstoSewa',
  description:
    'Learn how to perform Shiva, Vishnu, and Ganesh pujas at home. Step-by-step Puja Bidhi guides with mantras and offerings. Start reading now.',
  keywords: [
    'Puja Bidhi',
    'Hindu puja guide',
    'Shiva puja Bidhi',
    'Ganesh puja steps',
    'Vishnu puja ritual',
    'puja mantra',
  ],
  alternates: {
    canonical: '/puja-bidhi',
  },
  openGraph: {
    title: 'Hindu Puja Guides, Rituals and Mantras | AstoSewa',
    description:
      'Learn how to perform Shiva, Vishnu, and Ganesh pujas at home. Step-by-step Puja Bidhi guides with mantras and offerings. Start reading now.',
  },
};

import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import PujaBidhiHeader from '@/components/pages/puja-bidhi/header';
import SectionDivider from '@/components/ui/section-divider';
import { ghostClient } from '@/lib/ghostClient';
import { fetchBlogViewCounts } from '@/lib/blog-view-api';
import { mapGhostBlogPost } from '@/lib/map-ghost-blog-post';

async function getPujaBidhiPosts() {
  try {
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
      ],
      limit: 'all',
      order: 'published_at desc',
    });

    const viewCounts = await fetchBlogViewCounts(
      posts.map(post => post.slug ?? '').filter(Boolean),
    );

    return posts.map(post => ({
      ...mapGhostBlogPost(post, viewCounts),
      link: `/puja-bidhi/${post.slug ?? ''}`,
    }));
  } catch (error) {
    console.error('Error fetching puja bidhi posts:', error);
    return [];
  }
}

const PujaBidhiPage = async () => {
  const posts = await getPujaBidhiPosts();

  return (
    <main className="container mx-auto min-h-screen overflow-hidden pb-16">
      <div>
        <PujaBidhiHeader posts={posts} />
      </div>
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Clarity />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Services />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <DownloadApp noBorder />
    </main>
  );
};

export default PujaBidhiPage;

import React from 'react';

import clsx from 'clsx';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';

import LandingPageCSS from '../landing-page.module.css';
import DownloadApp from '@/components/pages/landing/download-app';
import BlogHeader from '@/components/pages/blogs/header';
import { ghostClient } from '@/lib/ghostClient';

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
      'feature_image',
      'published_at',
      'reading_time',
      'primary_tag',
    ],
    limit: 'all',
    order: 'published_at desc',
  });

  return posts.map(post => ({
    id: post.id ?? '',
    title: post.title ?? '',
    slug: post.slug ?? '',
    description: post.excerpt ?? '',
    image: post.feature_image ?? '',
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
    author: post.authors?.[0]?.name ?? 'Unknown Author',
    duration: post.reading_time ? `${post.reading_time} Min` : '1 Min',
    views: '0', // Ghost doesn't provide views by default
    feature: post.tags?.map(tag => tag.name ?? '').filter(Boolean) ?? [],
    tagSlugs: post.tags?.map(tag => tag.slug ?? '').filter(Boolean) ?? [],
    link: `/blogs/${post.slug}`,
  }));
}

const BlogPage = async () => {
  const [tags, posts] = await Promise.all([getBlogTags(), getBlogPosts()]);
  return (
    <main className={clsx('min-h-screen space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
        <BlogHeader tags={tags} posts={posts} />
      </div>
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <DownloadApp />
      <Footer />
    </main>
  );
};

export default BlogPage;

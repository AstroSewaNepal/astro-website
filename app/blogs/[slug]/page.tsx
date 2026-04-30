import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import clsx from 'clsx';

import { ghostClient } from '@/lib/ghostClient';
import Footer from '@/components/pages/landing/footer';
import Services from '@/components/pages/landing/services';
import LandingPageCSS from '../../landing-page.module.css';
import BlogContent from '@/components/pages/blogs/content';
import DownloadApp from '@/components/pages/landing/download-app';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
// import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';

type BlogPostData = {
  id: string;
  title: string;
  slug: string;
  html: string;
  feature_image: string | null;
  published_at: string | null;
  reading_time: number | null;
  og_image?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  twitter_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tags?: Array<{
    name?: string;
    slug?: string;
  }>;
  authors?: Array<{
    name?: string;
    profile_image?: string;
    bio?: string;
    facebook?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  }>;
  primary_author?: {
    name?: string;
    profile_image?: string;
    bio?: string;
    facebook?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  };
};

async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  try {
    const post = await ghostClient.posts.read(
      { slug },
      {
        include: ['authors', 'tags'],
        fields: [
          'id',
          'title',
          'slug',
          'html',
          'feature_image',
          'published_at',
          'reading_time',
          'excerpt',
          'og_image',
          'og_title',
          'og_description',
          'twitter_image',
          'twitter_title',
          'twitter_description',
          'meta_title',
          'meta_description',
        ],
        formats: ['html'],
      },
    );

    if (!post) {
      return null;
    }

    return {
      id: post.id ?? '',
      title: post.title ?? '',
      slug: post.slug ?? '',
      html: post.html ?? '',
      feature_image: post.feature_image ?? null,
      published_at: post.published_at ?? null,
      reading_time: post.reading_time ?? null,
      og_image: post.og_image ?? null,
      og_title: post.og_title ?? null,
      og_description: post.og_description ?? null,
      twitter_image: post.twitter_image ?? null,
      twitter_title: post.twitter_title ?? null,
      twitter_description: post.twitter_description ?? null,
      meta_title: post.meta_title ?? null,
      meta_description: post.meta_description ?? null,
      tags:
        post.tags?.map(tag => ({
          name: tag.name ?? undefined,
          slug: tag.slug ?? undefined,
        })) ?? [],
      authors:
        post.authors?.map(author => ({
          name: author.name ?? undefined,
          profile_image: author.profile_image ?? undefined,
          bio: author.bio ?? undefined,
          facebook: (author as { facebook?: string | null }).facebook ?? null,
          twitter: (author as { twitter?: string | null }).twitter ?? null,
          linkedin: (author as { linkedin?: string | null }).linkedin ?? null,
          instagram: (author as { instagram?: string | null }).instagram ?? null,
          youtube: (author as { youtube?: string | null }).youtube ?? null,
          tiktok: (author as { tiktok?: string | null }).tiktok ?? null,
        })) ?? [],
      primary_author: post.primary_author
        ? {
            name: post.primary_author.name ?? undefined,
            profile_image: post.primary_author.profile_image ?? undefined,
            bio: post.primary_author.bio ?? undefined,
            facebook: (post.primary_author as { facebook?: string | null }).facebook ?? null,
            twitter: (post.primary_author as { twitter?: string | null }).twitter ?? null,
            linkedin: (post.primary_author as { linkedin?: string | null }).linkedin ?? null,
            instagram: (post.primary_author as { instagram?: string | null }).instagram ?? null,
            youtube: (post.primary_author as { youtube?: string | null }).youtube ?? null,
            tiktok: (post.primary_author as { tiktok?: string | null }).tiktok ?? null,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const BlogDetailPage = async (props: BlogDetailPageProps) => {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const author = post.primary_author ?? post.authors?.[0];
  const authorName = author?.name ?? 'Unknown Author';
  const authorImage = author?.profile_image ?? undefined;
  const authorBio = author?.bio ?? undefined;
  const authorSocial = {
    facebook: author?.facebook,
    twitter: author?.twitter,
    linkedin: author?.linkedin,
    instagram: author?.instagram,
    youtube: author?.youtube,
    tiktok: author?.tiktok,
  };
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const views = '0'; // Ghost doesn't provide views by default

  return (
    <main className={clsx('min-h-screen space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
        <BlogContent
          title={post.title}
          html={post.html}
          featureImage={post.feature_image}
          author={authorName}
          authorImage={authorImage}
          authorBio={authorBio}
          authorSocial={authorSocial}
          date={date}
          views={views}
          tags={post.tags ?? []}
        />
      </div>
      {/* <TalkToOurAstrologer /> */}
      <Services />
      <DownloadApp />
      <Footer />
    </main>
  );
};

export default BlogDetailPage;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  const title = post.meta_title ?? post.og_title ?? post.title ?? undefined;
  const description = post.meta_description ?? post.og_description ?? undefined;
  const ogImage = post.og_image ?? post.feature_image ?? undefined;
  const twitterImage = post.twitter_image ?? ogImage ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title: post.og_title ?? title,
      description: post.og_description ?? description,
      images: ogImage ? [ogImage] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.twitter_title ?? title,
      description: post.twitter_description ?? description,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

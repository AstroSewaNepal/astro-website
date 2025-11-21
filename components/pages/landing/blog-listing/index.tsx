'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import BlogComponents from '@/components/common/blog-components';
import { BlogPlaceholderImage } from '@/components/images';
import ChevronRight from '@/components/icons/chevron-right';

type GhostTag = {
  name?: string;
  slug?: string;
};

type GhostAuthor = {
  name?: string;
};

type GhostPost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  feature_image?: string;
  published_at?: string;
  reading_time?: number;
  authors?: GhostAuthor[];
  tags?: GhostTag[];
};

type BlogPost = {
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
  link: string;
};

const transformPost = (post: GhostPost): BlogPost => ({
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
  views: '0',
  feature: post.tags?.map((tag: GhostTag) => tag.name ?? '').filter(Boolean) ?? [],
  link: `/blogs/${post.slug ?? ''}`,
});

const AstrologerBlogListing: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url =
          '/api/ghost/posts?include=tags,authors&fields=id,title,slug,excerpt,feature_image,published_at,reading_time&limit=3&order=published_at%20desc';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const fetchedPosts = Array.isArray(data.posts) ? data.posts : [];
        const transformedPosts = fetchedPosts.map(transformPost);
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
        <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
          Astrologer Blogs
        </h2>
        <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-black opacity-80 max-w-[780px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
          Explore articles from our expert astrologers, filled with timeless wisdom, spiritual
          insights, and practical astrology tips for everyday life.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-10 lg:mt-[50px] gap-4 md:gap-6 lg:gap-[32px] 2xl:gap-[64px]">
        {isLoading ? (
          <>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="animate-pulse border border-solid border-[#79787A] rounded-[28px] px-[22px] py-[18px]"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              </div>
            ))}
          </>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="font-mukta text-lg md:text-xl text-[#5B5B5B]">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="font-mukta text-lg md:text-xl text-[#5B5B5B]">No blog posts available.</p>
          </div>
        ) : (
          posts.map(post => (
            <BlogComponents
              key={`blog-component-${post.id}`}
              date={post.date}
              feature={post.feature}
              image={post.image || BlogPlaceholderImage}
              author={post.author}
              duration={post.duration}
              views={post.views}
              title={post.title}
              description={post.description}
              link={post.link}
            />
          ))
        )}
      </div>
      <div className="flex items-center justify-center mt-8 md:mt-10 lg:mt-[50px]">
        <Link href="/blogs">
          <button className="flex items-center gap-1 md:gap-2 border border-solid border-[#5B5B5B] rounded-3xl px-6 md:px-8 py-2.5 md:py-3.5 transition-all duration-300 hover:bg-[#5B5B5B]/5">
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl text-[#5B5B5B]">
              Explore More
            </p>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[#5B5B5B]" />
          </button>
        </Link>
      </div>
    </section>
  );
};

export default AstrologerBlogListing;

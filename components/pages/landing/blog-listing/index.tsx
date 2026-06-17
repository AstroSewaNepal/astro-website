'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import BlogComponents from '@/components/common/blog-components';
import { BlogPlaceholderImage } from '@/components/images';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';
import { fetchBlogViewCounts } from '@/lib/blog-view-api';
import {
  mapGhostBlogPost,
  type GhostBlogPost,
  type MappedBlogPost,
} from '@/lib/map-ghost-blog-post';

const AstrologerBlogListing: React.FC = () => {
  const [posts, setPosts] = useState<MappedBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prev => (posts.length > 1 ? (prev === 0 ? posts.length - 1 : prev - 1) : 0));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (posts.length > 1 ? (prev === posts.length - 1 ? 0 : prev + 1) : 0));
  };

  useEffect(() => {
    if (currentIndex >= posts.length) {
      setCurrentIndex(0);
    }
  }, [posts, currentIndex]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url =
          '/api/ghost/posts?include=tags,authors&fields=id,title,slug,excerpt,html,feature_image,published_at,reading_time&limit=3&order=published_at%20desc';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const fetchedPosts = Array.isArray(data.posts) ? (data.posts as GhostBlogPost[]) : [];
        const viewCounts = await fetchBlogViewCounts(
          fetchedPosts.map(post => post.slug ?? '').filter(Boolean),
        );
        const transformedPosts = fetchedPosts.map(post => mapGhostBlogPost(post, viewCounts));
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
      <div className="md:hidden mt-8">
        <div className="relative">
          {isLoading ? (
            <div className="animate-pulse border border-solid border-[#79787A] rounded-[28px] px-[22px] py-[18px]">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="font-mukta text-lg text-[#5B5B5B]">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-mukta text-lg text-[#5B5B5B]">No blog posts available.</p>
            </div>
          ) : (
            <BlogComponents
              key={`blog-component-${posts[currentIndex]?.id}`}
              date={posts[currentIndex].date}
              feature={posts[currentIndex].feature}
              image={posts[currentIndex].image || BlogPlaceholderImage}
              author={posts[currentIndex].author}
              duration={posts[currentIndex].duration}
              views={posts[currentIndex].views}
              title={posts[currentIndex].title}
              description={posts[currentIndex].description}
              link={posts[currentIndex].link}
            />
          )}

          {posts.length > 1 && !isLoading && !error ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous blog"
                className="absolute left-[-10] top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-transparent transition-colors hover:bg-[#fff7f4]"
                style={{ border: '1.27px solid #611508' }}
              >
                <ArrowLeft className="w-[14px] h-[14px] text-[#611508]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next blog"
                className="absolute right-[-10] top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-transparent transition-colors hover:bg-[#fff7f4]"
                style={{ border: '1.27px solid #611508' }}
              >
                <ArrowRight className="w-[14px] h-[14px] text-[#611508]" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-10 lg:mt-[50px] gap-4 md:gap-6 lg:gap-[32px] 2xl:gap-[64px]">
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
          <p
            className="font-mukta font-normal text-[18px] md:text-[24px] leading-[28px] underline decoration-[#611508] decoration-[1.2px] underline-offset-[2px] text-[#611508]"
            style={{
              fontStyle: 'normal',
              letterSpacing: '0%',
              textDecorationSkipInk: 'auto',
            }}
          >
            Show More
          </p>
        </Link>
      </div>
    </section>
  );
};

export default AstrologerBlogListing;

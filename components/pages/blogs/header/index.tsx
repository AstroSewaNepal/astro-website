'use client';
import React from 'react';
import ArrowLeftIcon from '@/components/icons/arrow-left';
import ArrowRightIcon from '@/components/icons/arrow-right';
import BlogComponents from '@/components/common/blog-components';
import { BlogPlaceholderImage } from '@/components/images';
import { useBlogPosts, type BlogPost } from './useBlogPosts';

type BlogTag = {
  name: string;
  slug: string;
};

type BlogHeaderProps = {
  tags: BlogTag[];
  posts: BlogPost[];
};

const BlogHeader: React.FC<BlogHeaderProps> = ({ tags, posts: initialPosts }) => {
  const {
    activeCategory,
    setActiveCategory,
    isLoading,
    displayedPosts,
    hasMorePosts,
    handleShowMore,
  } = useBlogPosts(initialPosts);

  const categories: BlogTag[] = [{ name: 'All Categories', slug: '' }, ...tags];

  return (
    <div className="flex flex-col items-center gap-8 md:gap-12 container mx-auto px-6 lg:px-0 py-12 md:py-16">
      <div className="flex flex-col items-center gap-4 md:gap-6 max-w-4xl">
        <h1 className="font-tiro-devanagari text-4xl md:text-5xl lg:text-6xl font-normal text-primary text-center leading-tight">
          Astrologer Blogs
        </h1>
        <p className="font-mukta text-lg md:text-xl lg:text-2xl font-normal text-black/80 text-center leading-relaxed tracking-wide max-w-[890px]">
          Explore articles from our expert astrologers, filled with timeless wisdom, spiritual
          insights, and practical astrology tips for everyday life.
        </p>
      </div>

      <div className="flex items-center gap-4 md:gap-8 w-full max-w-6xl">
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-moonlight-500 flex items-center justify-center hover:bg-moonlight-50 transition-colors flex-shrink-0">
          <ArrowLeftIcon className="w-1.5 h-3 text-moonlight-500" />
        </button>

        <div className="flex items-center gap-3 md:gap-5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          {categories.map(category => (
            <button
              key={category.slug || 'all-categories'}
              onClick={() => setActiveCategory(category.slug)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-mukta text-base md:text-lg font-light leading-7 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeCategory === category.slug
                  ? 'bg-primary text-white'
                  : 'border border-primary text-primary hover:bg-primary/5'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-moonlight-500 flex items-center justify-center hover:bg-moonlight-50 transition-colors flex-shrink-0">
          <ArrowRightIcon className="w-1.5 h-3 text-moonlight-500" />
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-[50px] lg:gap-[32px] 2xl:gap-[64px]">
        {isLoading ? (
          <div className="col-span-3 text-center py-12">
            <p className="font-mukta text-xl text-[#5B5B5B]">Loading posts...</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="font-mukta text-xl text-[#5B5B5B]">No posts found.</p>
          </div>
        ) : (
          displayedPosts.map(post => (
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
      {hasMorePosts && (
        <div className="mt-[50px] flex items-center justify-center">
          <button
            onClick={handleShowMore}
            className="flex items-center gap-2 border border-solid border-[#5B5B5B] rounded-3xl px-8 py-3.5 hover:bg-[#5B5B5B]/5 transition-colors"
          >
            <p className="font-mukta text-2xl text-[#5B5B5B]">Show More</p>
            <ArrowLeftIcon className="w-[8px] h-[16px] text-[#5B5B5B] -rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogHeader;

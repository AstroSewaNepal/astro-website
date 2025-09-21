'use client';
import React, { useState } from 'react';
import ArrowLeftIcon from '@/components/icons/arrow-left';
import ArrowRightIcon from '@/components/icons/arrow-right';
import { BLOG_LISTING_CONST } from '../../landing/blog-listing/blog-listing.const';
import BlogComponents from '@/components/common/blog-components';

const CATEGORIES = [
  'All Categories',
  'Angels Numbers',
  'Vastu Sastra',
  'Vedic Astrology',
  'Kundali Milan',
  'Gems stones',
];

const BlogHeader: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All Categories');

  return (
    <div className="flex flex-col items-center gap-8 md:gap-12 container mx-auto px-6 lg:px-0 py-12 md:py-16">
      {/* Title and Description Section */}
      <div className="flex flex-col items-center gap-4 md:gap-6 max-w-4xl">
        <h1 className="font-tiro-devanagari text-4xl md:text-5xl lg:text-6xl font-normal text-primary text-center leading-tight">
          Astrologer Blogs
        </h1>
        <p className="font-mukta text-lg md:text-xl lg:text-2xl font-normal text-black/80 text-center leading-relaxed tracking-wide max-w-[890px]">
          Explore articles from our expert astrologers, filled with timeless wisdom, spiritual
          insights, and practical astrology tips for everyday life.
        </p>
      </div>

      {/* Category Filter Section */}
      <div className="flex items-center gap-4 md:gap-8 w-full max-w-6xl">
        {/* Left Arrow */}
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-moonlight-500 flex items-center justify-center hover:bg-moonlight-50 transition-colors flex-shrink-0">
          <ArrowLeftIcon className="w-1.5 h-3 text-moonlight-500" />
        </button>

        {/* Category Buttons - Scrollable on mobile */}
        <div className="flex items-center gap-3 md:gap-5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-mukta text-base md:text-lg font-light leading-7 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'border border-primary text-primary hover:bg-primary/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-moonlight-500 flex items-center justify-center hover:bg-moonlight-50 transition-colors flex-shrink-0">
          <ArrowRightIcon className="w-1.5 h-3 text-moonlight-500" />
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-[50px] lg:gap-[32px] 2xl:gap-[64px]">
        {BLOG_LISTING_CONST.map(item => (
          <BlogComponents key={`blog-component-${item.id}`} {...item} />
        ))}
      </div>
      <div className="mt-[50px] flex items-center justify-center">
        <button className="flex items-center gap-2 border border-solid border-[#5B5B5B] rounded-3xl px-8 py-3.5">
          <p className="font-mukta text-2xl text-[#5B5B5B]">Show More</p>
          <ArrowLeftIcon className="w-[8px] h-[16px] text-[#5B5B5B] -rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default BlogHeader;

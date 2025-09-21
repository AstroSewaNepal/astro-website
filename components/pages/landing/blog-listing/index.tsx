import React from 'react';

import BlogComponents from '@/components/common/blog-components';
import { BLOG_LISTING_CONST } from './blog-listing.const';
import ChevronRight from '@/components/icons/chevron-right';

const AstrologerBlogListing: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-[56px] leading-[47.83px] font-normal text-primary">Astrologer Blogs</h2>
        <p className="font-mukta text-2xl leading-7 text-black opacity-80 max-w-[780px] text-center mt-6">
          Explore articles from our expert astrologers, filled with timeless wisdom, spiritual
          insights, and practical astrology tips for everyday life.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-[50px] lg:gap-[32px] 2xl:gap-[64px]">
        {BLOG_LISTING_CONST.map(item => (
          <BlogComponents key={`blog-component-${item.id}`} {...item} />
        ))}
      </div>
      <div className="flex items-center justify-center mt-[50px]">
        <button className="flex items-center gap-1 border border-solid border-[#5B5B5B] rounded-3xl px-8 py-3.5">
          <p className="font-mukta text-2xl text-[#5B5B5B]">Explore More</p>
          <ChevronRight className="w-6 h-6 text-[#5B5B5B]" />
        </button>
      </div>
    </section>
  );
};

export default AstrologerBlogListing;

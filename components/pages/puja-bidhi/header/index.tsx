import React from 'react';

import BlogComponents from '@/components/common/blog-components';
import { BlogPlaceholderImage } from '@/components/images';
import type { MappedBlogPost } from '@/lib/map-ghost-blog-post';

type PujaBidhiHeaderProps = {
  posts: MappedBlogPost[];
};

const PujaBidhiHeader: React.FC<PujaBidhiHeaderProps> = ({ posts }) => {
  return (
    <section className="container mx-auto px-6 lg:px-0 py-12 md:py-16">
      <div className="flex flex-col justify-center items-center">
        <h1 className="font-tiro-devanagari text-4xl md:text-5xl lg:text-6xl font-normal text-primary text-center leading-tight">
          Puja Bidhi
        </h1>
        <p className="font-mukta text-lg md:text-xl lg:text-2xl font-normal text-black/80 text-center leading-relaxed tracking-wide max-w-[890px]">
          Explore articles from our expert astrologers, filled with timeless wisdom, spiritual
          insights, and practical astrology tips for everyday life.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-[50px] lg:gap-[32px] 2xl:gap-[64px]">
        {posts.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="font-mukta text-xl text-[#5B5B5B]">No posts found.</p>
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
    </section>
  );
};

export default PujaBidhiHeader;

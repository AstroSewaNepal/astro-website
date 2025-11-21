'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, FacebookIcon, TwitterIcon, LinkedinIcon } from '@/components/images/icons';
import { BsFacebook, BsLinkedin, BsTwitterX } from 'react-icons/bs';

interface BlogTitleProps {
  title?: string;
  author?: string;
  authorImage?: string;
  date?: string;
  views?: string;
}

const BlogTitle: React.FC<BlogTitleProps> = ({
  title = 'The Timeless Power of Vedic Astrology',
  author = 'Prakrity Shahh',
  authorImage,
  date = 'August 20, 2022',
  views = '8523',
}) => {
  // Get current page URL
  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  // Share handlers
  const handleFacebookShare = () => {
    const url = getCurrentUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const url = getCurrentUrl();
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const url = getCurrentUrl();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Chevron icon for breadcrumb
  const ChevronIcon = () => (
    <svg
      width="8"
      height="13"
      viewBox="0 0 8 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[7.66px] h-[13.3px]"
    >
      <path
        d="M1 1L7 6.5L1 12"
        stroke="#5B5B5B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <section className="flex flex-col gap-7 container mx-auto px-6 lg:px-0">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="font-mukta text-base font-medium leading-7 text-[#5B5B5B] hover:text-primary transition-colors"
          >
            Home
          </Link>
        </div>
        <ChevronIcon />
        <div className="flex items-center gap-1">
          <Link
            href="/blogs"
            className="font-mukta text-base font-medium leading-7 text-[#5B5B5B] hover:text-primary transition-colors"
          >
            Blog
          </Link>
        </div>
        <ChevronIcon />
        <span className="font-mukta text-base font-medium leading-7 text-[#5B5B5B]">
          Blog Details
        </span>
      </div>

      {/* Blog Title */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-tiro-devanagari text-[48px] font-normal leading-[1.2] tracking-[0.02em] text-[#691709]">
          {title}
        </h1>
      </div>

      {/* Info Section */}
      <div className="flex flex-row items-center gap-[35px] pb-4 border-b border-royal-400">
        {/* Left Side - Author, Date, Views */}
        <div className="flex items-center gap-6">
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D9D9D9] overflow-hidden flex-shrink-0">
              {authorImage ? (
                <Image
                  src={authorImage}
                  alt={author}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-royal-200 to-royal-400" />
              )}
            </div>
            <span className="font-sahitya text-[28px] font-normal leading-[1.357] text-[#4A494B]">
              {author}
            </span>
          </div>

          {/* Date */}
          <span className="font-mukta text-base font-medium leading-7 text-[#4A494B]">{date}</span>

          {/* Views */}
          {/* <div className="flex items-center justify-center gap-2">
            <Image src={EyeIcon} alt="Views" width={16} height={16} className="w-4 h-4" />
            <span className="font-mukta text-base font-medium leading-5 text-[#79787A]">
              {views}
            </span>
          </div> */}
        </div>

        {/* Right Side - Share */}
        <div className="flex items-center gap-2">
          <span className="font-mukta text-base font-medium leading-7 text-black">Share:</span>
          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex items-center justify-center p-2 rounded-[32px] border border-royal-200 hover:bg-royal-50 transition-colors"
            aria-label="Share on Facebook"
          >
            <BsFacebook />
          </button>
          {/* Twitter */}
          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center p-2 rounded-[32px] border border-royal-200 hover:bg-royal-50 transition-colors"
            aria-label="Share on Twitter"
          >
            <BsTwitterX />
          </button>
          {/* LinkedIn */}
          <button
            onClick={handleLinkedInShare}
            className="flex items-center justify-center p-2 rounded-[32px] border border-royal-200 hover:bg-royal-50 transition-colors"
            aria-label="Share on LinkedIn"
          >
            <BsLinkedin />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogTitle;

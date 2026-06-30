import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';

import BlogCard from './blog-card';
import { EyeIcon } from '@/components/images/icons';

import BlogCardCSS from './blog-card.module.css';
import clsx from 'clsx';

interface IBlogComponentsProps {
  date: string;
  feature: Array<string>;
  image: StaticImageData | string;
  author: string;
  duration: string;
  views: string;
  title: string;
  description: string;
  link: string;
}

const BlogComponents: React.FC<IBlogComponentsProps> = ({
  date,
  feature,
  image,
  author,
  duration,
  views,
  title,
  description,
  link,
}) => {
  return (
    <Link href={link} className="block group mx-auto w-[317px] md:w-[440px]">
      <article className="flex flex-col border border-solid border-[#79787A] border-[1.5px] rounded-[36px] md:rounded-[40px] p-[16px] md:p-[20px] transition-colors hover:border-[#611508]/40 opacity-100 h-[487px] md:h-[680px] overflow-hidden bg-transparent">
        <div className="flex items-center justify-between">
          <p className="font-mukta text-[13px] md:text-[15px] text-[#5B5B5B] whitespace-nowrap mr-2">
            {date}
          </p>
          <div className="flex items-center gap-1 overflow-hidden">
            {feature.slice(0, 2).map((item, index) => (
              <BlogCard content={item} key={`${item}-${index}`} />
            ))}
            {feature.length > 2 && <BlogCard content={`+${feature.length - 2}`} />}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center mt-3 md:mt-4 rounded-[16px] md:rounded-[24px] overflow-hidden w-full h-[180px] md:h-[292px] opacity-100 shrink-0">
            <Image
              src={image}
              width={396}
              height={292}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-3 md:mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 text-[12px] md:text-sm font-mukta">
              <div className="flex items-center gap-1">
                <p className="font-bold text-[#181A2A]">Author</p>
                <p className="text-[#181A2A]">{author}</p>
              </div>
              <div className="flex items-center gap-1">
                <p className="font-bold text-[#181A2A]">Duration</p>
                <p className="text-[#181A2A]">{duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Image
                src={EyeIcon}
                alt="Eye"
                width={16}
                height={16}
                className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0"
              />
              <p className="font-mukta text-[12px] md:text-sm text-[#4A494B] whitespace-nowrap">
                {views}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-[16px] md:mt-[22px] flex flex-col flex-1 min-h-0">
          <div className="space-y-[8px] md:space-y-[12px] overflow-hidden">
            <h3
              className={clsx(
                'font-tiro-devanagari text-[24px] md:text-[28px] leading-[1.25] text-[#181A2A] group-hover:text-primary transition-colors',
                BlogCardCSS['title-line-clamp'],
              )}
            >
              {title}
            </h3>
            <p
              className={clsx(
                'font-mukta text-[14px] md:text-[16px] text-[#5B5B5B] leading-relaxed',
                BlogCardCSS['description-line-clamp'],
              )}
            >
              {description}
            </p>
          </div>
          <span className="block w-full bg-primary py-2.5 md:py-3 cursor-pointer rounded-3xl mt-auto shrink-0 font-mukta text-lg md:text-xl text-[#F8F3DF] text-center transition-opacity hover:opacity-90">
            Read More
          </span>
        </div>
      </article>
    </Link>
  );
};

export default BlogComponents;

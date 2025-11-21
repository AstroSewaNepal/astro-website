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
    <article className="border border-solid border-[#79787A] rounded-[28px] px-[22px] py-[18px]">
      <div className="flex items-center justify-between">
        <p className="font-mukta text-xl text-[#5B5B5B]">{date}</p>
        <div className="flex items-center gap-1">
          {feature.slice(0, 1).map((item, index) => (
            <BlogCard content={item} key={`${item}-${index}`} />
          ))}
          {feature.length > 1 && <BlogCard content={`+${feature.length - 1}`} />}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-center mt-[15px] rounded-[8px]">
          <Image src={image} width={500} height={100} alt="Blog Placeholder" />
        </div>
        <div className="mt-[11px] flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm font-mukta">
            <div className="flex items-center gap-2">
              <p className="font-bold">Author</p>
              <p>{author}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold">Duration</p>
              <p>{duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Image src={EyeIcon} alt="Eye" width={16} height={16} className="w-4 h-4" />
            <p className="font-mukta text-base text-[#4A494B]">{views}</p>
          </div>
        </div>
      </div>
      <div className="mt-[18px]">
        <div className="space-y-[15px]">
          <h3
            className={clsx(
              'text-[32px] leading-[40px] text-[#181A2A]',
              BlogCardCSS['title-line-clamp'],
            )}
          >
            {title}
          </h3>
          <p
            className={clsx(
              'font-mukta text-xl text-[#5B5B5B]',
              BlogCardCSS['description-line-clamp'],
            )}
          >
            {description}
          </p>
        </div>
        <Link href={link}>
          <button className="w-full bg-primary py-3.5 cursor-pointer rounded-3xl mt-4 font-mukta text-2xl text-[#F8F3DF]">
            Read More
          </button>
        </Link>
      </div>
    </article>
  );
};

export default BlogComponents;

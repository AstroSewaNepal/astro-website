import React from 'react';

interface IBlogCardProps {
  content: string;
}

const BlogCard: React.FC<IBlogCardProps> = ({ content }) => {
  return (
    <div className="border border-solid border-[#5b5b5b] rounded-[32px] py-0.5 px-3 md:px-4 min-w-max">
      <p className="font-mukta text-[12px] md:text-[14px] text-[#5b5b5b]">{content}</p>
    </div>
  );
};

export default BlogCard;

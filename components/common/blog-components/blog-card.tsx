import React from 'react';

interface IBlogCardProps {
  content: string;
}

const BlogCard: React.FC<IBlogCardProps> = ({ content }) => {
  return (
    <div className="border border-solid border-[#5b5b5b] rounded-[32px] py-1 px-4 min-w-max">
      <p className="font-mukta text-base text-[#5b5b5b]">{content}</p>
    </div>
  );
};

export default BlogCard;

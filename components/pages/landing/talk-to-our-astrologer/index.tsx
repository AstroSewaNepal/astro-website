'use client';

import React from 'react';
import clsx from 'clsx';

import TopAstrologers from './TopAstrologers';
import type { AstrologerCardActions } from './types';

interface TalkToOurAstrologerProps extends AstrologerCardActions {
  title?: string;
  description?: string;
  className?: string;
}

const TalkToOurAstrologer: React.FC<TalkToOurAstrologerProps> = ({
  title = 'Talk To Our Top Astrologer',
  description = 'Connect with our most trusted and experienced astrologers for personalized guidance, accurate predictions, and compassionate support on your life’s journey.',
  className,
  onChat,
  onCall,
  onSchedule,
}) => {
  return (
    <section
      className={clsx(
        'talk-to-our-astrologer-section container mx-auto max-w-full px-3 sm:px-5 lg:px-0',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6">
        <h2
          className="max-w-[20ch] px-1 text-center font-sahitya text-[26px] font-normal leading-[1.12] text-primary sm:max-w-none sm:text-[34px] sm:leading-tight md:text-[42px] lg:text-[52px] xl:text-[56px]"
          style={{
            fontFamily: 'Tiro Devanagari Sanskrit',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '56px',
            lineHeight: '47.83px',
            letterSpacing: '0%',
            textAlign: 'center',
          }}
        >
          {title}
        </h2>
        <p
          className="max-w-[810px] px-1 text-center font-mukta text-black/75"
          style={{
            fontFamily: 'Mukta',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '24px',
            lineHeight: '150%',
            letterSpacing: '2%',
            textAlign: 'center',
            textTransform: 'capitalize',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </p>
      </div>

      <TopAstrologers onChat={onChat} onCall={onCall} onSchedule={onSchedule} />
    </section>
  );
};

export default TalkToOurAstrologer;

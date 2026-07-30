'use client';

import React from 'react';
import clsx from 'clsx';

import TopAstrologers from './TopAstrologers';
import type { AstrologerCardActions } from './types';

interface TalkToOurAstrologerProps extends AstrologerCardActions {
  title?: string;
  description?: string;
  className?: string;
  descriptionClassName?: string;
}

const TalkToOurAstrologer: React.FC<TalkToOurAstrologerProps> = ({
  title = 'Talk to a Verified Astrologer',
  description = 'Choose an astrologer, pick chat or call, and get a reading tailored to your birth chart. Available in English, Hindi, and Nepali.',
  className,
  descriptionClassName,
  onChat,
  onCall,
  onSchedule,
}) => {
  return (
    <>
      <style>{`
        @media (min-width: 640px) {
          .astrologer-title-heading {
            font-size: 56px !important;
          }
          .astrologer-subtitle-description {
            font-size: 24px !important;
          }
        }
      `}</style>
      <section
        className={clsx(
          'talk-to-our-astrologer-section container mx-auto max-w-full px-3 sm:px-5 lg:px-0',
          className,
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2 sm:gap-5 md:gap-6">
          <h2
            className="astrologer-title-heading max-w-none px-1 text-center font-normal text-primary sm:max-w-[40ch] sm:leading-tight md:text-[42px] lg:text-[52px] xl:text-[56px]"
            style={{
              fontFamily: 'Tiro Devanagari Sanskrit',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '24px',
              lineHeight: '47.83px',
              letterSpacing: '0%',
              textAlign: 'center',
            }}
          >
            {title}
          </h2>
          <p
            className={clsx(
              'astrologer-subtitle-description max-w-[810px] px-1 text-center font-mukta text-black/75',
              descriptionClassName,
            )}
            style={{
              fontFamily: 'Mukta',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: '150%',
              letterSpacing: '2%',
              textAlign: 'center',
              textTransform: 'capitalize',
            }}
          >
            {description}
          </p>
        </div>

        <TopAstrologers onChat={onChat} onCall={onCall} onSchedule={onSchedule} />
      </section>
    </>
  );
};

export default TalkToOurAstrologer;

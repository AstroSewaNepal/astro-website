'use client';
import clsx from 'clsx';
import React, { useId, useState } from 'react';

import ChevronRight from '@/components/icons/chevron-right';

interface IQNASComponentProps {
  question: string;
  answer: string;
  isDefaultOpen?: boolean;
}

const QNASComponent: React.FC<IQNASComponentProps> = ({
  question,
  answer,
  isDefaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const answerId = useId();

  return (
    <div className="border border-solid border-[#79787A] rounded-xl md:rounded-2xl px-4 md:px-8 lg:px-[62px] py-4 md:py-6 lg:py-8">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => setIsOpen(prev => !prev)}
        className="flex w-full cursor-pointer justify-between gap-4 md:gap-6 text-left"
      >
        <span className="font-mukta text-base md:text-lg lg:text-xl xl:text-[28px] leading-6 md:leading-7 lg:leading-8 xl:leading-[32px] text-primary font-bold">
          {question}
        </span>
        <ChevronRight
          aria-hidden="true"
          className={clsx(
            'w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0 mt-1',
            'transition-all duration-300',
            isOpen ? '-rotate-90' : 'rotate-0',
          )}
        />
      </button>
      <div
        id={answerId}
        role="region"
        className={clsx(
          'grid overflow-hidden transition-all duration-300',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0">
          <p className="font-mukta text-sm md:text-base lg:text-lg xl:text-2xl text-[#5B5B5B] mt-2 md:mt-3 lg:mt-[14px]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QNASComponent;

'use client';
import clsx from 'clsx';
import React, { useState } from 'react';

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

  return (
    <div
      className="border border-solid border-[#79787A] rounded-2xl px-[62px] py-8 flex cursor-pointer justify-between"
      onClick={() => setIsOpen(prev => !prev)}
    >
      <div className="flex flex-col justify-center">
        <p className="font-mukta text-[28px] leading-[32px] text-primary font-bold">{question}</p>
        <div
          className={clsx(
            'grid overflow-hidden transition-all duration-300',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0">
            <p className="font-mukta text-2xl text-[#5B5B5B] mt-[14px]">{answer}</p>
          </div>
        </div>
      </div>
      <div>
        <ChevronRight
          className={clsx(
            'w-6 h-6 text-primary',
            'transition-all duration-300',
            isOpen ? '-rotate-90' : 'rotate-0',
          )}
        />
      </div>
    </div>
  );
};

export default QNASComponent;

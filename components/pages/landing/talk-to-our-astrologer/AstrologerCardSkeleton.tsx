'use client';

import React, { memo } from 'react';

const AstrologerCardSkeleton = memo(function AstrologerCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="h-full overflow-hidden rounded-4xl border border-solid border-[#0000007D] shadow-[0_8px_32px_rgba(97,21,8,0.08)] animate-pulse"
    >
      <div className="flex flex-col p-6 pt-11 sm:p-7 sm:pt-12">
        <div className="flex flex-col items-center">
          <div className="h-[132px] w-[132px] rounded-full bg-[#e8dcc8]/70 sm:h-[148px] sm:w-[148px] md:h-[156px] md:w-[156px]" />
          <div className="mt-5 h-6 w-40 rounded-full bg-[#e8dcc8]/80" />
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="h-4 w-4 rounded-full bg-[#f0d9b8]/80" />
            ))}
          </div>
          <div className="mt-5 h-8 w-32 rounded-full bg-[#e8dcc8]/80" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[48px] rounded-3xl border border-[#79787A]/30 bg-white/40 px-3 py-2 sm:min-h-[52px]"
            >
              <div className="h-3 w-full rounded bg-[#e8dcc8]/70" />
              <div className="mt-2 h-3 w-4/5 rounded bg-[#e8dcc8]/50" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 bg-primary/80 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex gap-2.5">
          <span className="h-10 w-10 rounded-full bg-white/40 sm:h-11 sm:w-11" />
          <span className="h-10 w-10 rounded-full bg-white/40 sm:h-11 sm:w-11" />
        </div>
        <span className="h-10 w-28 rounded-full bg-white/30 sm:h-11 sm:w-32" />
      </div>
    </article>
  );
});

export default AstrologerCardSkeleton;

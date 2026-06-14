import React from 'react';
import ArrowLeft from '../../icons/arrow-left';
import ArrowRight from '../../icons/arrow-right';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
  hideControls?: boolean;
  dotClassName?: string;
  dotGap?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  className = '',
  hideControls = false,
  dotClassName = 'w-[4.784643650054932px] h-[4.784643650054932px]',
  dotGap = '4.16px',
}) => {
  const dots = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visibleDots =
    totalPages <= 3
      ? dots
      : currentPage <= 2
        ? [1, 2, 3]
        : currentPage >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [currentPage - 1, currentPage, currentPage + 1];

  return (
    <div className={`flex items-center gap-6 ${className}`} aria-label="services-pagination">
      {!hideControls && (
        <button
          onClick={onPrevious}
          aria-label="Previous services"
          className="w-[40.72px] h-[40.72px] rounded-full flex items-center justify-center bg-transparent hover:bg-[#fff7f4] transition-colors opacity-100"
          style={{ border: '1.27px solid #611508' }}
        >
          <ArrowLeft className="w-[15px] h-[15px] text-[#611508]" />
        </button>
      )}

      {/* Pagination Dots */}
      <div className="flex items-center justify-center" style={{ gap: dotGap }}>
        {visibleDots.map(page => (
          <button
            key={page}
            aria-label={`Go to page ${page}`}
            onClick={() => onPageChange(page)}
            className={`rounded-full transition-colors opacity-100 ${
              page === currentPage ? 'bg-[#611508]' : 'bg-[#d9bdb7] hover:opacity-80'
            } ${dotClassName}`}
            style={{
              padding: 0,
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              lineHeight: 0,
              boxSizing: 'border-box',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              fontSize: 0,
            }}
          />
        ))}
      </div>

      {!hideControls && (
        <button
          onClick={onNext}
          aria-label="Next services"
          className="w-[40.72px] h-[40.72px] rounded-full flex items-center justify-center bg-transparent hover:bg-[#fff7f4] transition-colors opacity-100"
          style={{ border: '1.27px solid #611508' }}
        >
          <ArrowRight className="w-[15px] h-[15px] text-[#611508]" />
        </button>
      )}
    </div>
  );
};

export default Pagination;

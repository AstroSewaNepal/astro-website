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
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  className = '',
}) => {
  const dots = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className={`flex items-center gap-6 ${className}`} aria-label="services-pagination">
      {/* Left Arrow Button */}
      <button
        onClick={onPrevious}
        aria-label="Previous services"
        className="w-[40.72px] h-[40.72px] rounded-full flex items-center justify-center bg-transparent hover:bg-[#fff7f4] transition-colors opacity-100"
        style={{ border: '1.27px solid #611508' }}
      >
        <ArrowLeft className="w-[15px] h-[15px] text-[#611508]" />
      </button>

      {/* Pagination Dots */}
      <div className="flex items-center gap-3">
        {dots.map(page => (
          <button
            key={page}
            aria-label={`Go to page ${page}`}
            onClick={() => onPageChange(page)}
            className={`rounded-full transition-colors shadow-sm opacity-100 ${
              page === currentPage ? 'bg-[#611508]' : 'bg-[#d9bdb7] hover:opacity-80'
            }`}
            style={{ width: '10.363306999206543px', height: '10.363306999206543px' }}
          />
        ))}
      </div>

      {/* Right Arrow Button */}
      <button
        onClick={onNext}
        aria-label="Next services"
        className="w-[40.72px] h-[40.72px] rounded-full flex items-center justify-center bg-transparent hover:bg-[#fff7f4] transition-colors opacity-100"
        style={{ border: '1.27px solid #611508' }}
      >
        <ArrowRight className="w-[15px] h-[15px] text-[#611508]" />
      </button>
    </div>
  );
};

export default Pagination;

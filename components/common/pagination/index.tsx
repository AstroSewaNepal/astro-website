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
    <div className={`flex items-center gap-5 ${className}`}>
      {/* Left Arrow Button */}
      <button
        onClick={onPrevious}
        className="w-[40.72px] h-[40.72px] rounded-full border border-[#5B5B5B] flex items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ borderWidth: '0.84px' }}
      >
        <ArrowLeft />
      </button>

      {/* Pagination Dots */}
      <div className="flex items-center gap-[9px]">
        {dots.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-[10.36px] h-[10.36px] rounded-full transition-colors ${
              page === currentPage ? 'bg-[#5B5B5B]' : 'bg-[rgba(91,91,91,0.4)] hover:bg-[#5B5B5B]'
            }`}
          />
        ))}
      </div>

      {/* Right Arrow Button */}
      <button
        onClick={onNext}
        className="w-[40.72px] h-[40.72px] rounded-full border border-[#5B5B5B] flex items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ borderWidth: '0.84px' }}
      >
        <ArrowRight />
      </button>
    </div>
  );
};

export default Pagination;

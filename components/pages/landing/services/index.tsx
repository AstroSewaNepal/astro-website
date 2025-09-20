'use client';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

import { SERVICES_LIST } from './service.const';
import Pagination from '@/components/common/pagination';

const Services = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalPages = Math.ceil(SERVICES_LIST.length / 4);
  const itemsPerPage = 4;

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return SERVICES_LIST.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPage(page);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    } else {
      // Infinite loop to last page
      handlePageChange(totalPages);
    }
  };

  const handleNext = () => {
    if (isTransitioning) return;
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    } else {
      // Infinite loop to first page
      handlePageChange(1);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Mouse drag handlers for desktop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const distance = dragStart - e.clientX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setIsDragging(false);
    setDragStart(null);
  };

  // Prevent text selection during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <section className="py-20">
      <div className="max-w-[1450px] mx-auto px-5 flex flex-col items-center gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 max-w-[1405px] w-full">
          <h2 className="text-[56px] leading-[47.83px] text-primary font-tiro-devanagari">
            Our Services
          </h2>
          <p className="font-mukta text-2xl text-[#000000CF] max-w-[753px] text-center">
            Explore our range of trusted astrology services, designed to bring clarity, guidance,
            and confidence to every step of your journey.
          </p>
        </div>

        {/* Services Grid with Swipe Support */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setDragStart(null);
          }}
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full transition-all duration-300 ${
              isTransitioning ? 'opacity-90 scale-[0.98]' : 'opacity-100 scale-100'
            } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {getCurrentPageItems().map(service => (
              <div
                key={service.id}
                className="flex flex-col items-center gap-6 w-full min-h-[450px] flex-shrink-0 p-5 select-none"
              >
                <div className="flex justify-center items-center w-[189px] h-[222px]">
                  <div className="w-full h-full flex justify-center items-center rounded-lg">
                    <Image
                      src={service.icon}
                      alt={`${service.buttonText} icon`}
                      width={189}
                      height={222}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 w-full flex-1 justify-between">
                  <h3 className="font-mukta text-[20px] leading-[120%] text-[#000000CF] text-center">
                    {service.title}
                  </h3>
                  <button className="flex justify-center items-center gap-2.5 px-[18px] py-2 w-full bg-[#691709] border-none rounded-[32px] cursor-pointer transition-all duration-300 hover:bg-[#8b1f0f] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(105,23,9,0.3)] active:translate-y-0">
                    <span className="font-mukta font-bold text-lg leading-[1.78] text-center text-[#f8f3df]">
                      {service.buttonText}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </section>
  );
};

export default Services;

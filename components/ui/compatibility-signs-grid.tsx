'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

import type { HoroscopeSign } from '@/lib/types/horoscope';

type SignImage = string | StaticImageData;

export type CompatibilitySignItem = {
  slug: HoroscopeSign;
  name: string;
  image: SignImage;
  imageLight?: SignImage;
  href: string;
};

type Props = {
  title: string;
  currentSignLabel: string;
  currentSignImage: SignImage;
  currentSignImageLight?: SignImage;
  items: CompatibilitySignItem[];
  variant?: 'compact' | 'figma';
  className?: string;
};

export function CompatibilitySignsGrid({
  title,
  currentSignLabel,
  currentSignImage,
  currentSignImageLight,
  items,
  variant = 'compact',
  className,
}: Props) {
  const currentLight = currentSignImageLight ?? currentSignImage;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const dots = useMemo(() => items.map((_, index) => index), [items]);

  const updateActiveIndex = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const slides = Array.from(containerRef.current.children) as HTMLElement[];
    const active = slides.findIndex(slide => {
      const rect = slide.getBoundingClientRect();
      return rect.left >= containerRect.left - 1;
    });
    setActiveIndex(active >= 0 ? active : 0);
  };

   
  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(updateActiveIndex);
    const element = containerRef.current;
    if (!element) {
      cancelAnimationFrame(raf);
      return;
    }
    element.addEventListener('scroll', updateActiveIndex, { passive: true });
    window.addEventListener('resize', updateActiveIndex);
    return () => {
      cancelAnimationFrame(raf);
      element.removeEventListener('scroll', updateActiveIndex);
      window.removeEventListener('resize', updateActiveIndex);
    };
  }, [items]);

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const slide = containerRef.current.children[index] as HTMLElement | undefined;
    if (!slide) return;
    containerRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  };

  const renderSignImage = (colorSrc: SignImage, lightSrc: SignImage, alt: string, alwaysColor?: boolean) => {
    if (alwaysColor) {
      return (
        <div className="relative h-[96px] w-[100px] sm:h-[96px] sm:w-[110px]">
          <Image
            src={colorSrc}
            alt={alt}
            className="h-full w-full object-contain opacity-100"
          />
        </div>
      );
    }
    return (
      <div className="relative h-[96px] w-[100px] sm:h-[96px] sm:w-[110px]">
        <Image
          src={lightSrc}
          alt={alt}
          className="h-full w-full object-contain opacity-100 transition-opacity duration-300 group-hover:opacity-0"
        />
        <Image
          src={colorSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="font-mukta text-[18px] font-semibold text-[#6f2618] lg:font-sahitya lg:font-bold lg:text-[28px] lg:leading-[38px] lg:tracking-[0%]">{title}</h3>
      <div
        ref={containerRef}
        className={clsx(
          'mt-3 lg:mt-8 flex snap-x snap-mandatory overflow-x-auto gap-3 px-2 pb-2 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4',
          variant === 'figma' ? 'sm:gap-4' : 'sm:gap-3',
        )}
      >
        {items.map(item => {
          const itemLight = item.imageLight ?? item.image;
          return (
            <Link
              key={item.slug}
              href={item.href}
              onClick={() => window.scrollTo(0, 0)}
              className={clsx(
                'group transition-colors snap-start flex-shrink-0',
                variant === 'figma'
                  ? 'flex min-h-[172px] min-w-[260px] items-center justify-center gap-4 rounded-[20px] border border-[#383838] bg-[#FFFFFF99] hover:bg-[#F8F3DF] p-4'
                  : 'min-w-[220px] rounded-[10px] border border-[#d7c3b1] bg-[#fdf8f1] hover:border-[#f4a11a]/80 px-2 py-2',
              )}
            >
              {variant === 'figma' ? (
                <>
                  <div className="flex h-full w-[100px] flex-col items-center gap-4">
                    {renderSignImage(currentSignImage, currentLight, currentSignLabel, true)}
                    <span className="font-mukta text-[18px] font-normal leading-7 text-[#611508]">
                      {currentSignLabel}
                    </span>
                  </div>
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    fill="none"
                    className="flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.0013 39.1417L19.343 36.7217C9.9013 28.16 3.66797 22.495 3.66797 15.5833C3.66797 9.91833 8.10464 5.5 13.7513 5.5C16.9413 5.5 20.003 6.985 22.0013 9.31333C23.9996 6.985 27.0613 5.5 30.2513 5.5C35.898 5.5 40.3346 9.91833 40.3346 15.5833C40.3346 22.495 34.1013 28.16 24.6596 36.7217L22.0013 39.1417Z"
                      fill="#862C23"
                    ></path>
                  </svg>

                  <div className="flex h-full w-[110px] flex-col items-center gap-4">
                    {renderSignImage(item.image, itemLight, item.name)}
                    <span className="font-mukta text-[18px] font-normal leading-7 text-[#611508]">
                      {item.name}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-1">
                    <Image
                      src={currentLight}
                      alt={currentSignLabel}
                      className="h-[42px] w-[42px] object-contain"
                    />
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      className="flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.0013 39.1417L19.343 36.7217C9.9013 28.16 3.66797 22.495 3.66797 15.5833C3.66797 9.91833 8.10464 5.5 13.7513 5.5C16.9413 5.5 20.003 6.985 22.0013 9.31333C23.9996 6.985 27.0613 5.5 30.2513 5.5C35.898 5.5 40.3346 9.91833 40.3346 15.5833C40.3346 22.495 34.1013 28.16 24.6596 36.7217L22.0013 39.1417Z"
                        fill="#862C23"
                      ></path>
                    </svg>

                    <Image
                      src={itemLight}
                      alt={item.name}
                      className="h-[42px] w-[42px] object-contain"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between px-1">
                    <span className="font-mukta text-[10px] text-[#846e5f]">
                      {currentSignLabel}
                    </span>
                    <span className="font-mukta text-[10px] text-[#846e5f]">{item.name}</span>
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-2 sm:hidden">
        {dots.map(index => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={clsx(
              'h-2 min-w-[8px] rounded-full transition-colors',
              index === activeIndex ? 'bg-[#611508]' : 'bg-[#d7c3b1]'
            )}
          />
        ))}
      </div>
    </div>
  );
}

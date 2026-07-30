'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

import LandingFAQ from '@/components/pages/landing/faq';
import { ZodiacSignMiniCard } from '@/components/pages/zodiac-sign/zodiac-sign-mini-card';
import { ZodiacSignStripNav } from '@/components/pages/zodiac-sign/zodiac-sign-strip-nav';
import { useZodiacSignDetails } from '@/components/pages/zodiac-sign/use-zodiac-sign-details';
import { HOROSCOPE_DATA } from '@/components/pages/landing/today-horoscope/horoscope-data.const';
import { ELanguage } from '@/components/enums/language.enum';
import { zodiacNepaliDetailHref } from '@/lib/constants/zodiac-sign-nav';
import { NEPALI_ZODIAC_LIGHT } from '@/lib/zodiac-sign/nepali-zodiac';
import { NEPALI_ZODIAC_COLOR } from '@/lib/zodiac-sign/nepali-zodiac';
import { parseZodiacSignParam } from '@/lib/zodiac-sign/parse-sign-param';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';

const cardTextNp = 'तपाईंको चिंगारीले पहाडहरू सार्न सक्छ, आज साहसी सुरु गर्नुहोस्';

export function ZodiacSignDetailNepaliClient() {
  const searchParams = useSearchParams();
  const slug = useMemo(() => parseZodiacSignParam(searchParams.get('sign')), [searchParams]);
  const { row, loadError, loading } = useZodiacSignDetails(slug);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const updateActiveCarouselIndex = () => {
    if (!carouselRef.current) return;
    const containerRect = carouselRef.current.getBoundingClientRect();
    const slides = Array.from(carouselRef.current.children) as HTMLElement[];
    const activeIndex = slides.findIndex(slide => {
      const rect = slide.getBoundingClientRect();
      return rect.left >= containerRect.left - 1;
    });
    setActiveCarouselIndex(activeIndex >= 0 ? activeIndex : 0);
  };

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(updateActiveCarouselIndex);
    const element = carouselRef.current;
    if (!element) {
      cancelAnimationFrame(raf);
      return;
    }

    element.addEventListener('scroll', updateActiveCarouselIndex, { passive: true });
    window.addEventListener('resize', updateActiveCarouselIndex);

    return () => {
      cancelAnimationFrame(raf);
      element.removeEventListener('scroll', updateActiveCarouselIndex);
      window.removeEventListener('resize', updateActiveCarouselIndex);
    };
  }, []);

  const scrollToCarouselIndex = (index: number) => {
    if (!carouselRef.current) return;
    const slide = carouselRef.current.children[index] as HTMLElement | undefined;
    if (!slide) return;
    carouselRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  };

  const signIndex = HOROSCOPE_SIGNS.indexOf(slug);
  const nepaliName = HOROSCOPE_DATA[ELanguage.NEPALI][signIndex]?.name ?? slug;

  const traits = row
    ? [
        { label: 'तत्व', value: row.element },
        { label: 'राशिको ग्रह', value: row.ruling_planet },
        {
          label: 'सामञ्जस्यपूर्ण राशि',
          value: row.compatibility?.length ? row.compatibility.join(', ') : '—',
        },
        {
          label: 'बलियो पक्ष',
          value: row.strengths?.length ? row.strengths.join(', ') : '—',
        },
        {
          label: 'चुनौतीपूर्ण पक्ष',
          value: row.weaknesses?.length ? row.weaknesses.join(', ') : '—',
        },
        { label: 'व्यक्तित्व', value: row.personality_traits || '—' },
      ]
    : [];

  const description = row?.intro ?? row?.card_summary ?? '';
  const shouldTruncate = description.length > 300;
  const displayedDescription =
    shouldTruncate && !isExpanded ? description.slice(0, 300) + '...' : description;

  return (
    <main className="container mx-auto min-h-screen overflow-hidden">
      <div className="min-w-0 px-3 py-4 sm:px-4">
        <section className="mx-auto mt-6 min-w-0">
          <ZodiacSignStripNav
            activeSign={slug}
            language={ELanguage.NEPALI}
            imageBySign={NEPALI_ZODIAC_COLOR}
            lightImageBySign={NEPALI_ZODIAC_LIGHT}
            hrefForSign={zodiacNepaliDetailHref}
            showActiveDot
            large
          />

          <div className="mt-8 lg:mt-10 border-t border-[#be7b71] pt-8">
            <div className="mt-6 flex min-w-0 flex-col gap-6 lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-4 lg:opacity-100">
              <div className="min-w-0 order-2 lg:order-none sm:mt-6">
                <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#611508] sm:text-[36px] sm:leading-[48px]">
                  {nepaliName}
                </h1>
                <p className="mt-1 font-mukta text-[16px] text-[#101010] sm:text-[18px] sm:leading-[30px]">
                  {row?.slug ? `${row.slug} · ` : null}
                  {row?.date_range
                    ? typeof row.date_range === 'object'
                      ? `${row.date_range.from || ''} - ${row.date_range.to || ''}`
                      : row.date_range
                    : ''}
                </p>

                <div className="mt-4 max-w-[1120px]">
                  {loading ? (
                    <p className="font-mukta text-[16px] leading-8 text-[#383838] sm:text-[18px] sm:leading-[30px] lg:text-[24px] lg:leading-[34px]">
                      लोड हुँदैछ…
                    </p>
                  ) : loadError ? (
                    <p className="font-mukta text-[16px] leading-8 text-[#b42318] sm:text-[18px] sm:leading-[30px] lg:text-[24px] lg:leading-[34px]">
                      {loadError}
                    </p>
                  ) : (
                    <>
                      <p className="font-mukta text-[16px] leading-8 text-[#383838] sm:text-[18px] sm:leading-[30px] lg:text-[24px] lg:leading-[34px]">
                        {displayedDescription}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="mt-2 text-[#be7b71] hover:text-[#a06860] font-mukta font-semibold text-[16px] sm:text-[18px]"
                        >
                          {isExpanded ? 'कम देखाउनुहोस्' : 'थप पढ्नुहोस्'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div
                className="hidden lg:block order-1 shrink-0 lg:order-none lg:justify-self-end mb-6"
                style={{ width: '308.29px' }}
              >
                <Image
                  src={NEPALI_ZODIAC_COLOR[slug]}
                  alt={nepaliName}
                  className="mb-4 h-[297px] w-[308px] object-contain"
                />
              </div>
            </div>
          </div>

          {!loading && !loadError && traits.length > 0 ? (
            <section className="mt-8 border-t border-[#be7b71] py-8">
              <div className="overflow-x-auto rounded-[8px] border border-[#ebe0d4]">
                <table className="w-full min-w-[700px] border-collapse">
                  <tbody>
                    {traits.map(tr => (
                      <tr key={tr.label} className="border-b border-[#ebe0d4] last:border-b-0">
                        <td className="w-[36%] px-4 py-4 font-mukta text-[16px] sm:text-[18px] text-[#7c6556]">
                          {tr.label}
                        </td>
                        <td className="px-4 py-4 font-mukta text-[16px] sm:text-[18px] text-[#4f463f]">
                          {tr.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {/* Mobile Slider */}
          <div
            ref={carouselRef}
            className="mt-[48px] sm:mt-[100px] flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide sm:hidden"
          >
            {HOROSCOPE_SIGNS.map((s, i) => {
              const card = HOROSCOPE_DATA[ELanguage.NEPALI][i]!;
              return (
                <div key={s} className="min-w-[260px] shrink-0 snap-start">
                  <ZodiacSignMiniCard
                    href={zodiacNepaliDetailHref(s)}
                    image={card.image}
                    imageColor={card.imageColor}
                    name={card.name}
                    blurb={cardTextNp}
                    readMoreLabel="थप पढ्नुहोस्"
                  />
                </div>
              );
            })}
          </div>

          {/* Mobile Pagination */}
          <div className="mt-3 flex justify-center gap-2 sm:hidden">
            {(() => {
              let startDot = Math.max(0, activeCarouselIndex - 1);
              if (startDot + 3 > HOROSCOPE_SIGNS.length) {
                startDot = Math.max(0, HOROSCOPE_SIGNS.length - 3);
              }
              const visibleDots = HOROSCOPE_SIGNS.map((_, i) => i).slice(startDot, startDot + 3);
              return visibleDots.map(index => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to card ${index + 1}`}
                  onClick={() => scrollToCarouselIndex(index)}
                  className={clsx(
                    'h-2 min-w-[8px] rounded-full transition-all duration-300',
                    index === activeCarouselIndex ? 'bg-[#611508]' : 'bg-[#d7c3b1]',
                  )}
                />
              ));
            })()}
          </div>

          {/* Desktop Grid */}
          <div className="mt-[48px] sm:mt-[100px] hidden sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {HOROSCOPE_SIGNS.map((s, i) => {
              const card = HOROSCOPE_DATA[ELanguage.NEPALI][i]!;
              return (
                <ZodiacSignMiniCard
                  key={s}
                  href={zodiacNepaliDetailHref(s)}
                  image={card.image}
                  imageColor={card.imageColor}
                  name={card.name}
                  blurb={cardTextNp}
                  readMoreLabel="थप पढ्नुहोस्"
                />
              );
            })}
          </div>

          <div className="mt-[48px] sm:mt-[100px]">
            <LandingFAQ />
          </div>
        </section>
      </div>
    </main>
  );
}

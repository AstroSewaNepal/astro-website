'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

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

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-6 max-w-[1180px]">
          <ZodiacSignStripNav
            activeSign={slug}
            language={ELanguage.NEPALI}
            imageBySign={NEPALI_ZODIAC_COLOR}
            lightImageBySign={NEPALI_ZODIAC_LIGHT}
            hrefForSign={zodiacNepaliDetailHref}
            showActiveDot
            className="mt-4"
          />

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
            <div>
              <h1 className="font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
                {nepaliName}
              </h1>
              <p className="mt-1 font-mukta text-[14px] text-[#8a7463]">
                {row?.sign ? `${row.sign} · ` : null}
                {row?.date_range ?? ''}
              </p>

              <div className="mt-3 max-w-[860px]">
                {loading ? (
                  <p className="font-mukta text-[13px] leading-7 text-[#4f463f]">लोड हुँदैछ…</p>
                ) : loadError ? (
                  <p className="font-mukta text-[13px] leading-7 text-[#b42318]">{loadError}</p>
                ) : (
                  <p className="font-mukta text-[13px] leading-7 text-[#4f463f]">
                    {row?.intro ?? row?.card_summary ?? ''}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[10px] bg-[#f4ead2] p-5">
              <Image
                src={NEPALI_ZODIAC_COLOR[slug]}
                alt={nepaliName}
                className="mx-auto h-[80px] w-[80px] object-contain"
              />
            </div>
          </div>

          {!loading && !loadError && traits.length > 0 ? (
            <div className="mt-8 overflow-x-auto rounded-[8px] border border-[#ebe0d4]">
              <table className="w-full min-w-[700px] border-collapse">
                <tbody>
                  {traits.map(tr => (
                    <tr key={tr.label} className="border-b border-[#ebe0d4] last:border-b-0">
                      <td className="w-[36%] px-4 py-3 font-mukta text-[13px] text-[#7c6556]">
                        {tr.label}
                      </td>
                      <td className="px-4 py-3 font-mukta text-[13px] text-[#4f463f]">
                        {tr.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-16">
            <LandingFAQ />
          </div>
        </section>
      </div>
    </main>
  );
}

'use client';

import clsx from 'clsx';
import Image from 'next/image';

import LandingFAQ from '@/components/pages/landing/faq';
import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import {
  EnglishAriesLight,
  EnglishTaurusLight,
  EnglishCancerLight,
  EnglishGeminiLight,
  EnglishLeoLight,
  EnglishVirgoLight,
  EnglishLibraLight,
  EnglishScorpioLight,
  EnglishSagittariusLight,
  EnglishAquariusLight,
  EnglishPiscesLight,
  EnglishCapricornLight,
} from '@/components/images/zodiac/english';

import LandingPageCSS from '../../landing-page.module.css';

const zodiacCards = [
  { name: 'Aries', image: EnglishAriesLight },
  { name: 'Taurus', image: EnglishTaurusLight },
  { name: 'Cancer', image: EnglishCancerLight },
  { name: 'Gemini', image: EnglishGeminiLight },
  { name: 'Leo', image: EnglishLeoLight },
  { name: 'Virgo', image: EnglishVirgoLight },
  { name: 'Libra', image: EnglishLibraLight },
  { name: 'Scorpio', image: EnglishScorpioLight },
  { name: 'Sagittarius', image: EnglishSagittariusLight },
  { name: 'Aquarius', image: EnglishAquariusLight },
  { name: 'Pisces', image: EnglishPiscesLight },
  { name: 'Capricorn', image: EnglishCapricornLight },
];

const cardText = 'Your spark can move mountains, start bold today';

export default function ZodiacNepaliPage() {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <LandingHeader />
      <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-6 max-w-[1180px]">
          <p className="font-mukta text-[11px] text-[#7a6658]">
            Home &gt; Zodiac Sign &gt; Zodiac Sign-Nepali
          </p>

          <h1 className="mt-2 font-sahitya text-[34px] font-bold leading-none text-[#6b2417] sm:text-[42px]">
            Zodiac Sign (राशी चिन्ह)
          </h1>
          <p className="mt-2 font-mukta text-[18px] text-[#111111]">
            तपाईंको राशि चिन्ह र जन्मनक्षत्र पत्ता लगाउनुहोस्
          </p>

          <div className="mt-6 space-y-4 font-mukta text-[14px] leading-8 text-[#4f463f]">
            <p>
              यो एक नमुना नेपाली सामग्री हो जुन पेजको लेआउट देखाउनका लागि राखिएको हो। राशिफल र
              ज्योतिषीय विवरणहरू तपाईंको जन्म मिति, समय र स्थानका आधारमा फरक हुन सक्छन्। यस खण्डमा
              नेपाली भाषामा सामग्री देखिने गरी संरचना मिलाइएको छ।
            </p>
            <p>
              तपाईंले आफ्नो राशि अनुसारका विशेषता, बलियो पक्ष, कमजोरी, सम्बन्ध र दैनिक मार्गदर्शनका
              बारेमा यहाँ पढ्न सक्नुहुन्छ। यसले जीवनका निर्णयहरूमा स्पष्टता र आत्मविश्वास बढाउन
              सहयोग पुर्‍याउँछ।
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-full border border-[#6f2618] bg-[#6f2618] px-4 py-2 font-mukta text-[12px] text-white">
              English
            </button>
            <button className="rounded-full border border-[#c8af98] bg-[#fff8ef] px-4 py-2 font-mukta text-[12px] text-[#6f2618]">
              Nepali
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {zodiacCards.map(item => (
              <article
                key={item.name}
                className="rounded-[12px] border border-[#cfb8a5] bg-[#fcf6ed] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="h-[46px] w-[46px] object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="truncate font-mukta text-[13px] font-bold text-[#742718]">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-0.5 text-[#ef8a20]">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <StartIcon
                            key={`${item.name}-${index}`}
                            className="h-3 w-3 text-[#ef8a20]"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-0.5 font-mukta text-[10px] leading-4 text-[#7b6b61]">
                      {cardText}
                    </p>
                    <button className="mt-1 inline-flex items-center gap-1 border-b border-[#7b3b27] pb-0.5 font-mukta text-[10px] font-semibold text-[#7b3b27]">
                      Read More
                      <ArrowRight className="h-2.5 w-2.5 text-[#7b3b27]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 space-y-10">
            <div>
              <h2 className="font-sahitya text-[26px] font-bold text-[#6b2417]">
                राशी चिन्हको के हो?
              </h2>
              <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
                यो एक नमुना पाठ हो जुन नेपाली राशिफल पेजको संरचना मिलाउन राखिएको छ। तपाईंको राशि
                चिन्हले तपाईंको स्वभाव, सम्बन्ध, करियर, र जीवनका प्राथमिकताहरूमा संकेत दिन्छ। यसले
                आत्म-सम्झदारी बढाउन तथा भविष्यका निर्णयहरू सजिलै लिन मद्दत पुर्‍याउँछ।
              </p>
            </div>

            <div>
              <h2 className="font-sahitya text-[26px] font-bold text-[#6b2417]">
                राशी चिन्हको के हो?
              </h2>
              <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
                नेपाली भाषामा प्रस्तुत यो सामग्रीले राशि अनुसारका व्यवहार, सम्बन्धको सामञ्जस्य, र
                दैनिक चुनौतीहरूको संकेत दिन्छ। तपाईंको जन्मनक्षत्र र राशि अनुसारको मार्गदर्शनले
                तपाईंलाई जीवनमा स्पष्ट दिशा दिन सहयोग पुर्‍याउन सक्छ।
              </p>
            </div>

            <div>
              <h2 className="font-sahitya text-[26px] font-bold text-[#6b2417]">
                राशी चिन्हको के हो?
              </h2>
              <p className="mt-3 font-mukta text-[14px] leading-8 text-[#4f463f]">
                राशिफलको अध्ययनले व्यक्तित्वका गुण, सम्भावित कमजोरी, र अवसरहरूको पहिचान गर्न मद्दत
                गर्छ। यसबाट सम्बन्ध, स्वास्थ्य, शिक्षा, र करियरमा सन्तुलित दृष्टिकोण बनाउन सहज
                हुन्छ।
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-16 max-w-[1180px]">
          <LandingFAQ />
        </div>
      </div>

      <Footer />
    </main>
  );
}

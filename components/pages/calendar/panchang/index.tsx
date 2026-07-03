'use client';

import React from 'react';
import QNASComponent from '@/components/common/qnas-component';

import PanchangTodaySection from './panchang-today-section';

const PanchangCalendarPageContent: React.FC = () => {
  return (
    <div className="min-h-screen pt-2 pb-10 text-[#2a1f1a]">
      <div className="container mx-auto px-6 lg:px-0">
        <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
          Panchang Calendar: Daily Vedic Timings and Auspicious Moments
        </h1>

        <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d] mb-3">
          Check today&apos;s Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, sunrise, and moonrise for your location. Updated daily with real ephemeris data.
        </p>

        <hr className="border-t border-[#c0785a] mb-6" />

        <h2 className="text-[20px] leading-[30px] md:text-[28px] md:leading-[38px] font-bold font-sahitya text-[#7b1c1c] mb-3 tracking-wide">
          What is Panchang Calendar?
        </h2>

        <p className="text-[16px] leading-6 md:text-[24px] md:leading-[34px] font-normal font-mukta text-Paragraph w-full mb-8 md:mb-10 text-justify">
          The Panchang, also written Panchagam, is the Hindu almanac used to identify auspicious
          and inauspicious timings for daily life. It is computed from the positions of the Sun,
          Moon, and planets and rests on five elements: Tithi (lunar day), Vara (day of the week),
          Nakshatra (the Moon&apos;s current lunar mansion), Yoga (a quality derived from the combined
          positions of Sun and Moon), and Karana (half a Tithi, used for finer timing). Knowing the
          Panchang helps you choose the right moment for rituals, new beginnings, travel, signing
          agreements, and important conversations.
        </p>

        <PanchangTodaySection />

        <section className="mt-12 mb-8">
          <h2 className="text-[20px] leading-[30px] md:text-[28px] md:leading-[38px] font-bold font-sahitya text-[#7b1c1c] mb-3 tracking-wide">
            How to Read Today&apos;s Panchang
          </h2>

          <div className="mb-4">
            <h3 className="text-[16px] font-sahitya font-bold text-[#7b1c1c] mb-2">Tithi:</h3>
            <p className="text-[16px] leading-6 md:text-[20px] md:leading-[30px] font-normal font-mukta text-Paragraph text-justify">
              The lunar day. It changes roughly once every 24 hours based on the Moon&apos;s movement
              relative to the Sun. Different Tithis are auspicious for different activities. Some
              are good for starting new things and others are better for rest, ritual, or
              completion.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-[16px] font-sahitya font-bold text-[#7b1c1c] mb-2">Nakshatra:</h3>
            <p className="text-[16px] leading-6 md:text-[20px] md:leading-[30px] font-normal font-mukta text-Paragraph text-justify">
              The lunar mansion the Moon is currently moving through. There are 27 Nakshatras. The
              Moon spends about one day in each. Certain Nakshatras are highly auspicious for
              specific activities like travel, marriage, signing agreements, or worship.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-[16px] font-sahitya font-bold text-[#7b1c1c] mb-2">Yoga:</h3>
            <p className="text-[16px] leading-6 md:text-[20px] md:leading-[30px] font-normal font-mukta text-Paragraph text-justify">
              A combined quality calculated from the longitudes of the Sun and Moon. There are 27
              Yogas. Some such as Siddhi, Amrita, and Shubha are highly auspicious. Others like
              Vyatipata and Vaidhriti suggest caution for new starts.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-[16px] font-sahitya font-bold text-[#7b1c1c] mb-2">Karana:</h3>
            <p className="text-[16px] leading-6 md:text-[20px] md:leading-[30px] font-normal font-mukta text-Paragraph text-justify">
              Half of a Tithi. Used for refining timing within the day. There are 11 Karanas, some
              recurring and some fixed. Each is suited to different types of activities.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-[16px] font-sahitya font-bold text-[#7b1c1c] mb-2">Rahu Kaal:</h3>
            <p className="text-[16px] leading-6 md:text-[20px] md:leading-[30px] font-normal font-mukta text-Paragraph text-justify">
              The daily period associated with Rahu, considered inauspicious for starting new
              activities. It falls at a different time each day and varies by location. AstroSewa
              calculates this for your city automatically.
            </p>
          </div>
        </section>

        <section className="mt-12 pt-8 border-b border-b-[#79787A] pb-[100px]">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6 text-center">
            <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
              Frequently Asked Questions
            </h2>
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
              Find quick answers about Panchang, Muhurta, and how to use daily timings.
            </p>
          </div>
          <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
            <QNASComponent
              question="What Is Muhurta?"
              answer="Muhurta is the practice of selecting an auspicious time to begin an important activity. In Vedic tradition, starting something at the right moment, when the Tithi, Nakshatra, and planetary positions are favourable, is believed to give that activity the best possible foundation. The Panchang is the tool used to identify Muhurta. Weddings, business launches, travel, and religious ceremonies are all traditionally timed using Muhurta."
              isDefaultOpen={true}
            />
            <QNASComponent
              question="How Often Does the Panchang Change?"
              answer="Some elements change daily and others change more frequently. The Tithi changes roughly once per day but can sometimes change twice in one day or skip a day because it is based on the angle between the Sun and Moon, not a fixed clock. The Nakshatra changes approximately once per day. Yoga and Karana also shift throughout the day. This is why checking the Panchang daily is important rather than relying on a general monthly calendar."
            />
            <QNASComponent
              question="Is the Panchang the Same Everywhere?"
              answer="No. The Panchang is location-specific for sunrise and sunset times, moonrise and moonset, and Rahu Kaal. These all vary depending on where you are in the world. The Tithi, Nakshatra, and Yoga are the same globally at any given moment, but the times at which they begin and end are local. AstroSewa uses your selected city to calculate the correct local timings."
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default PanchangCalendarPageContent;

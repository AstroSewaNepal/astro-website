'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import PanchangCircleImage from '@/components/images/panchang_circle.png';
import ArrowLeft from '@/components/icons/arrow-left';
import ArrowRight from '@/components/icons/arrow-right';

const PanchangTodaySection: React.FC = () => {
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');

  return (
    <>
      <style>{`
        .date-input::placeholder,
        .city-input::placeholder {
          color: inherit;
        }
      `}</style>
      <section className="w-full max-w-[1454px] box-border min-h-[580px] flex flex-col lg:flex-row items-start gap-8 md:gap-10 opacity-100">
        <div className="w-full max-w-[982.6405px] min-h-[580px] flex flex-col gap-7 md:gap-10 opacity-100">
          <div className="w-full md:max-w-none">
            {/* Mobile-only controls */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="DD-MM-YYY"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="date-input h-[36px] rounded-full border border-primary px-4 font-mukta bg-secondary text-primary outline-none"
                />

                <input
                  type="text"
                  placeholder="Enter City Name"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="city-input h-[36px] rounded-full border border-primary px-4 font-mukta bg-secondary text-primary outline-none"
                />
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  style={{
                    width: '44px',
                    height: '44px',
                    opacity: 1,
                  }}
                  className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  style={{
                    width: '110px',
                    height: '44px',
                    borderRadius: '24px',
                    borderWidth: '0.5px',
                    padding: '8px 32px',
                    opacity: 1,
                  }}
                  className="bg-primary text-[#F8F3DF] border-primary font-mukta hover:bg-primary/80 transition-colors flex items-center justify-center"
                >
                  Today
                </button>
                <button
                  style={{
                    width: '44px',
                    height: '44px',
                    opacity: 1,
                  }}
                  className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Desktop-only controls */}
            <div className="hidden md:flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="DD-MM-YYY"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{
                  width: '208px',
                  height: '44px',
                  borderRadius: '32px',
                  borderWidth: '1px',
                  padding: '8px 100px 8px 24px',
                  opacity: 1,
                }}
                className="date-input border border-primary font-mukta bg-secondary text-primary outline-none"
              />

              <input
                type="text"
                placeholder="Enter City Name"
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{
                  width: '245px',
                  height: '44px',
                  borderRadius: '32px',
                  borderWidth: '1px',
                  padding: '8px 100px 8px 24px',
                  opacity: 1,
                }}
                className="city-input border border-primary font-mukta bg-secondary text-primary outline-none"
              />

              <button
                style={{
                  width: '44px',
                  height: '44px',
                  opacity: 1,
                }}
                className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                style={{
                  width: '105px',
                  height: '44px',
                  borderRadius: '24px',
                  borderWidth: '0.5px',
                  padding: '8px 32px',
                  opacity: 1,
                }}
                className="bg-primary text-[#F8F3DF] border-primary font-mukta hover:bg-primary/80 transition-colors flex items-center justify-center"
              >
                Today
              </button>
              <button
                style={{
                  width: '44px',
                  height: '44px',
                  opacity: 1,
                }}
                className="border border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] leading-[32px] md:text-[36px] md:leading-[44px] font-bold font-sahitya text-primary mb-4 md:mb-6">
              Panchangam for Today
            </h2>

            <div className="mx-auto mb-5 md:hidden w-[220px] h-[220px] flex items-center justify-center overflow-hidden rounded-full">
              <Image
                src={PanchangCircleImage}
                alt="Panchang zodiac circle"
                className="h-full w-full object-contain"
                priority
              />
            </div>

            {/* Panchang Card */}
            <div className="border border-Trinary rounded-lg w-full max-w-[900px] mt-5 md:mt-8">
              {/* Title */}
              <div className="px-4 md:px-6 pt-2 pb-2">
                <h3 className="text-[18px] leading-[24px] md:text-[26px] md:leading-[34px] font-mukta font-medium text-primary">
                  Jyeshtha, Shukla Shashti, Vikram Samvat 2082
                </h3>
              </div>

              {/* Divider Line */}
              <div className="border-b border-Trinary"></div>

              {/* Content */}
              <div className="px-4 md:px-6 py-4">
                {/* Date */}
                <p className="text-[28px] leading-[34px] md:text-[40px] md:leading-[46px] font-bold font-mukta text-[#7b1c1c] mb-2 md:mb-3">
                  August 29, 2025
                </p>

                {/* Day */}
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-Trinary font-medium mb-2 md:mb-3">
                  Friday
                </p>

                {/* Lunar Phase */}
                <p className="text-[20px] leading-[28px] md:text-[28px] md:leading-[36px] text-Trinary font-medium">
                  Shukla Paksha
                </p>
              </div>
            </div>

            {/* Panchang Details Grid */}
            <div className="w-full max-w-[900px] mt-3 md:mt-4 px-2 md:px-6 py-4">
              <div className="grid grid-cols-2 gap-2 md:gap-0">
                {/* Left Column */}
                <div>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Nakshatra:
                    </span>{' '}
                    Pushya
                  </p>

                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Yoga:
                    </span>{' '}
                    Vriddha
                  </p>
                </div>

                {/* Right Column */}
                <div>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Karana:
                    </span>{' '}
                    Kolav
                  </p>
                  <p className="font-mukta text-primary text-[18px] leading-[26px] md:text-[28px] md:leading-[36px] mb-2 md:mb-3">
                    <span className="font-mukta font-semibold text-Trinary text-[18px] md:text-[28px]">
                      Rashi:
                    </span>{' '}
                    Karka
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex mx-auto w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[432px] lg:h-[432px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
          <Image
            src={PanchangCircleImage}
            alt="Panchang zodiac circle"
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </section>
    </>
  );
};

export default PanchangTodaySection;

'use client';
import React, { useState } from 'react';

import clsx from 'clsx';
import Image from 'next/image';

import StartIcon from '@/components/icons/start-icon';
import ArrowRight from '@/components/icons/arrow-right';
import { HOROSCOPE_DATA } from './horoscope-data.const';
import { ELanguage } from '@/components/enums/language.enum';

const TodayHoroscope: React.FC = () => {
  const [language, setLanguage] = useState<ELanguage>(ELanguage.ENGLISH);

  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex w-full items-center justify-center flex-col">
        <h2 className="text-[56px] leading-[47.83px] font-normal text-primary text-center">
          Today&apos;s Astrology Horoscope
        </h2>
        <div className="mt-12 flex gap-5">
          <button
            className={clsx(
              'border border-solid border-primary rounded-3xl px-[35px] py-2.5 text-primary font-mukta text-xl leading-7 font-normal cursor-pointer transition-all duration-300 ease-in-out',
              language === ELanguage.ENGLISH && 'bg-primary text-white',
            )}
            onClick={() => setLanguage(ELanguage.ENGLISH)}
          >
            English
          </button>
          <button
            className={clsx(
              'border border-solid border-primary rounded-3xl px-[35px] py-2.5 text-primary font-mukta text-xl leading-7 font-normal cursor-pointer transition-all duration-300 ease-in-out',
              language === ELanguage.NEPALI && 'bg-primary text-white',
            )}
            onClick={() => setLanguage(ELanguage.NEPALI)}
          >
            Nepali
          </button>
        </div>
      </div>
      <div className="mt-[50px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {HOROSCOPE_DATA[language].map(item => (
          <div
            className="border border-solid border-moonlight-600 px-3.5 py-3 rounded-[33px] flex gap-5 items-center"
            key={item.name}
          >
            <div className="w-[100px] h-[100px] flex items-center justify-center">
              <Image src={item.image} alt={item.name} />
            </div>
            <div className="">
              <div className="flex items-center gap-2">
                <p className="font-mukta text-[22px] leading-[32px] text-primary font-bold">
                  {item.name}
                </p>
                <div className="flex items-center">
                  {Array(item.numberOfStars)
                    .fill(0)
                    .map((_, starIdx) => (
                      <StartIcon key={`${item.name}-star-${starIdx}`} />
                    ))}
                </div>
              </div>
              <p className="font-mukta text-sm leading-[120%] font-light text-[#5b5b5b]">
                {item.detail}
              </p>
              <button className="flex items-center border-b border-primary gap-[5px] cursor-pointer mt-2 text-[#F8F3DF]">
                <p className="font-mukta text-sm leading-7 font-semibold text-primary">Read More</p>
                <ArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodayHoroscope;

import React from 'react';
import Image from 'next/image';

import LoveCalculatorImage from '@/components/images/calculator/lovecalculator.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';
import DashaImage from '@/components/images/calculator/dasha.png';
import MoonPhaseImage from '@/components/images/calculator/moonphase.png';
import RashiCalculatorImage from '@/components/images/calculator/rashicalculator.png';

type CalculatorCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  mobileHorizontal?: boolean;
};

const CalculatorCard = ({
  title,
  description,
  icon,
  titleClassName,
  descriptionClassName,
  mobileHorizontal = false,
}: CalculatorCardProps) => {
  return (
    <article
      className={[
        'h-full rounded-[22px] border border-[#b8b0a8] bg-transparent shadow-[0_6px_18px_rgba(0,0,0,0.04)]',
        mobileHorizontal
          ? 'snap-start w-[332px] min-w-[332px] h-[184.0032px] rounded-[12px] border-[1px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] opacity-100 overflow-hidden shadow-none md:w-auto md:min-w-0 md:h-full md:rounded-[22px] md:px-6 md:pt-10 md:pb-6 md:shadow-[0_6px_18px_rgba(0,0,0,0.04)]'
          : 'px-6 pt-10 pb-6',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={
          mobileHorizontal
            ? 'hidden md:flex flex-col items-center text-center'
            : 'flex flex-col items-center text-center'
        }
      >
        <div className="h-[120px] flex items-start justify-center">{icon}</div>

        <h3
          className={[
            'mt-4 font-sahitya font-bold text-[14px] md:text-[15px] text-primary',
            titleClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </h3>
        <p
          className={[
            'mt-2 font-mukta text-[12px] md:text-[13px] leading-[1.6] text-[#6d6d6d] max-w-[220px]',
            descriptionClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>

        <button
          type="button"
          className="mt-4 w-full max-w-[425px] min-w-[84px] h-[48px] rounded-[24px] px-4 bg-primary font-mukta text-[18px] leading-[30px] font-semibold text-center text-secondary opacity-100"
        >
          Calculate
        </button>
      </div>

      {mobileHorizontal ? (
        <div className="md:hidden grid grid-cols-[128.2434px_1fr] gap-[16px] items-start">
          <div className="h-[168.0032px] flex flex-col items-center justify-between">
            <div className="h-[130.0032px] w-[128.2434px] flex items-center justify-center">
              {icon}
            </div>
            <button
              type="button"
              className="w-[134px] h-[28px] min-w-[84px] max-w-[480px] rounded-[24px] px-[16px] bg-primary font-mukta font-semibold text-[16px] leading-[28px] tracking-[0] text-center text-secondary opacity-100"
            >
              Calculate
            </button>
          </div>

          <div className="w-[134px] h-[140px] flex flex-col gap-[16px] opacity-100 mt-[8px]">
            <h3
              className={[
                'font-sahitya font-normal text-[20px] leading-[32px] tracking-[0] text-primary text-left',
                titleClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </h3>
            <p
              className={[
                'font-mukta font-medium text-[14px] leading-[140%] tracking-[0] text-[#2f2f2f] text-left',
                'line-clamp-4',
                descriptionClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {description}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
};

const Calculators: React.FC = () => {
  return (
    <section className="w-full px-3 md:px-8">
      <div className="max-w-[1454px] mx-auto">
        <h1 className="font-sahitya font-bold text-[30px] md:text-[36px] lg:text-[44px]  leading-[1.1] text-primary">
          Astrology Calculators
        </h1>
        <p className="mt-2 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.5] text-[#141414]">
          Life is like a calculator, you don’t even know how much your partner loves you. 😅
        </p>

        <p className="mt-6 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.7] text-Paragraph max-w-[1200px]">
          Explore your destiny with Astro Sewa&apos;s powerful Vedic and Western astrology tools.
          Instantly discover deeper insights about your personality, relationships, career, and life
          journey — all designed to guide you toward clarity and self-understanding.
        </p>

        <h2 className="mt-10 font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
          Choose Your Calculator
        </h2>

        <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible md:pb-0">
          <CalculatorCard
            title="Love Calculator"
            description="Discover your compatibility with a partner or potential love interest."
            mobileHorizontal
            icon={
              <Image
                src={LoveCalculatorImage}
                alt="Love calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Numerology Calculator"
            description="Discover your life path number and explore numerology insights."
            mobileHorizontal
            icon={
              <Image
                src={NumerologyCalculatorImage}
                alt="Numerology calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Sun Sign Calculator"
            description="Discover your zodiac sign based on birth date and astrology insights."
            mobileHorizontal
            icon={
              <Image
                src={SunSignCalculatorImage}
                alt="Sun sign calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Mangal Dosha Calculator"
            description="Check Mangal dosha and marriage effects in your birth chart."
            mobileHorizontal
            icon={
              <Image
                src={MangalDoshaImage}
                alt="Mangal dosha calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <div className="md:hidden">
            <CalculatorCard
              title="Dasha Calculator"
              description="Calculate planetary dasha periods and analyze timing of life events in Vedic astrology."
              mobileHorizontal
              icon={
                <Image
                  src={DashaImage}
                  alt="Dasha calculator"
                  width={130}
                  height={130}
                  className="h-[130.0032px] w-[128.2434px] object-contain opacity-100"
                />
              }
            />
          </div>

          <div className="md:hidden">
            <CalculatorCard
              title="Moon Phase Calculator"
              description="Track and explore current moon phases and lunar cycle changes over time."
              mobileHorizontal
              icon={
                <Image
                  src={MoonPhaseImage}
                  alt="Moon phase calculator"
                  width={130}
                  height={130}
                  className="h-[130.0032px] w-[128.2434px] object-contain opacity-100"
                />
              }
            />
          </div>

          <div className="md:hidden">
            <CalculatorCard
              title="Rashi Calculator"
              description="Discover your moon sign and understand your Vedic astrology birth chart insights."
              mobileHorizontal
              icon={
                <Image
                  src={RashiCalculatorImage}
                  alt="Rashi calculator"
                  width={130}
                  height={130}
                  className="h-[130.0032px] w-[128.2434px] object-contain opacity-100"
                />
              }
            />
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="mt-6 hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
        <CalculatorCard
          title="Dasha Calculator"
          titleClassName="md:text-[22px] md:leading-[32px] text-center"
          descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
          description="Calculate planetary dasha periods and analyze timing of life events in Vedic astrology."
          icon={
            <Image
              src={DashaImage}
              alt="Dasha calculator"
              width={130}
              height={130}
              className="h-[130.0032px] w-[128.2434px] md:h-[130.0032px] md:w-[128.2434px] object-contain opacity-100"
            />
          }
        />

        <CalculatorCard
          title="Moon Phase Calculator"
          titleClassName="md:text-[22px] md:leading-[32px] text-center"
          descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
          description="Track and explore current moon phases and lunar cycle changes over time."
          icon={
            <Image
              src={MoonPhaseImage}
              alt="Moon phase calculator"
              width={130}
              height={130}
              className="h-[130.0032px] w-[128.2434px] md:h-[130.0032px] md:w-[128.2434px] object-contain opacity-100"
            />
          }
        />

        <CalculatorCard
          title="Rashi Calculator"
          titleClassName="md:text-[22px] md:leading-[32px] text-center"
          descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
          description="Discover your moon sign and understand your Vedic astrology birth chart insights."
          icon={
            <Image
              src={RashiCalculatorImage}
              alt="Rashi calculator"
              width={130}
              height={130}
              className="h-[130.0032px] w-[128.2434px] md:h-[130.0032px] md:w-[128.2434px] object-contain opacity-100"
            />
          }
        />
      </div>
    </section>
  );
};

export default Calculators;

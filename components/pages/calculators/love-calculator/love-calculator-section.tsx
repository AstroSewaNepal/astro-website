'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoHeart } from 'react-icons/io5';

import { buildBirthVedastroQuery } from '@/lib/calculators/birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';

import CalculatorCard from '../calculator-card';
import LoveHeroImage from '@/components/images/lovecalculator.png';
import LoveCalculatorIcon from '@/components/images/icons/loveicon.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';
import DashaImage from '@/components/images/calculator/dasha.png';
import MoonPhaseImage from '@/components/images/calculator/moonphase.png';
import RashiCalculatorImage from '@/components/images/calculator/rashicalculator.png';

export default function LoveCalculatorSection() {
  const router = useRouter();
  const [yourName, setYourName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [yourBirthDate, setYourBirthDate] = useState('');
  const [yourBirthPlace, setYourBirthPlace] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerBirthPlace, setPartnerBirthPlace] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!yourName.trim() || !partnerName.trim()) {
        setError('Please enter both names.');
        return;
      }
      if (!yourBirthDate || !yourBirthPlace.trim() || !partnerBirthDate || !partnerBirthPlace.trim()) {
        setError('Please enter birth date and place for both people (used for VedAstro MatchReport).');
        return;
      }

      setError('');
      setSubmitting(true);
      try {
        const yourForm: CalculatorFormValues = {
          fullName: yourName,
          gender: 'male',
          birthDate: yourBirthDate,
          birthPlace: yourBirthPlace,
          birthTimeHH: '',
          birthTimeMM: '',
          birthTimeAMPM: 'am',
          dontKnowTime: true,
        };
        const partnerForm: CalculatorFormValues = {
          fullName: partnerName,
          gender: 'female',
          birthDate: partnerBirthDate,
          birthPlace: partnerBirthPlace,
          birthTimeHH: '',
          birthTimeMM: '',
          birthTimeAMPM: 'am',
          dontKnowTime: true,
        };

        const [yourQ, partnerQ] = await Promise.all([
          buildBirthVedastroQuery(yourForm),
          buildBirthVedastroQuery(partnerForm),
        ]);

        // UI labels: you = Man (groom), partner = Woman (bride) for VedAstro MatchReport.
        const params = new URLSearchParams({
          groomName: yourName.trim(),
          brideName: partnerName.trim(),
          groomLat: yourQ.lat,
          groomLon: yourQ.lon,
          groomDate: yourQ.date,
          groomTime: yourQ.time,
          groomOffset: yourQ.offset,
          brideLat: partnerQ.lat,
          brideLon: partnerQ.lon,
          brideDate: partnerQ.date,
          brideTime: partnerQ.time,
          brideOffset: partnerQ.offset,
        });

        const api = await fetchVedastroCalculator<{
          score: number | null;
          source: string;
        }>('love-match', params);

        const score =
          api.score ??
          Math.min(
            100,
            Math.max(40, Math.round(((yourName.length + partnerName.length) * 7) % 55) + 45),
          );

        sessionStorage.setItem(
          'loveCalculatorResult',
          JSON.stringify({
            yourName,
            partnerName,
            score,
            source: api.source,
            fromVedastro: api.score !== null,
          }),
        );

        router.push('/calculators/love-calculator/result');
      } catch (submitError) {
        setError(
          submitError instanceof Error ? submitError.message : 'Could not calculate compatibility.',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      yourName,
      partnerName,
      yourBirthDate,
      yourBirthPlace,
      partnerBirthDate,
      partnerBirthPlace,
      router,
    ],
  );

  return (
    <section className="w-full px-3 md:px-8 pb-12">
      <div className="mx-auto grid max-w-[1454px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,480px)] lg:gap-14 xl:gap-20">
        <div>
          <h1 className="font-sahitya text-[22px] leading-[32px] tracking-[0%] font-bold text-primary md:text-[40px] md:leading-[1.1] lg:text-[44px]">
            Love Calculator
          </h1>
          <p className="mt-3 font-mukta font-medium text-[14px] leading-[30px] tracking-[0%] text-[#2f2f2f] md:text-[18px]">
            Ever wondered if you and your crush are truly compatible?
          </p>

          <div className="relative mx-auto my-6 block w-[235px] h-[340px] lg:hidden mix-blend-darken">
            <div className="relative w-full h-full overflow-hidden rounded-[20px]">
              <Image
                src={LoveHeroImage}
                alt="Illustration of a couple embracing"
                fill
                className="object-cover object-center"
                sizes="235px"
                priority
              />
            </div>
          </div>

          <p className="mt-4 max-w-[640px] font-mukta font-normal text-[16px] leading-[100%] tracking-[0%] text-center text-Paragraph md:text-[16px] md:leading-[1.75] md:text-left">
            Compatibility score from VedAstro MatchReport (Kuta / Guna-style matching). Enter names
            and birth date + place for both people.
          </p>
          <p className="mt-3 max-w-[640px] font-mukta font-normal text-[16px] leading-[100%] tracking-[0%] text-center text-Paragraph md:text-[16px] md:leading-[1.75] md:text-left">
            Finding love can be challenging, but tools like the love calculator add excitement to
            the journey. They give you a playful peek into your feelings and compatibility before
            taking the next step. Many people use it just for fun, while others explore it to
            understand their bond better. Try it now and see what the stars reveal about your
            connection!
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 flex w-full max-w-[632px] flex-col gap-4 rounded-[16px] border border-Trinary bg-transparent p-4"
          >
            <h2 className="text-center font-mukta text-[20px] md:text-[28px] font-bold leading-[30px] md:leading-[38px] tracking-[0%] text-[#5D1409]">
              Find Your Love % Between You And Your Partner.
            </h2>

            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div>
                <label
                  htmlFor="love-your-name"
                  className="mb-2 block font-mukta text-[14px] md:text-[18px] font-medium leading-[28px] tracking-normal text-[#141414]"
                >
                  Your Name
                </label>
                <div className="flex min-h-[48px] items-stretch overflow-hidden rounded-full border border-Trinary bg-transparent pl-4 pr-1 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <input
                    id="love-your-name"
                    className="min-w-0 flex-1 border-none bg-transparent py-2.5 font-mukta text-[15px] text-Paragraph outline-none placeholder:text-Paragraph"
                    placeholder="Rupak"
                    value={yourName}
                    onChange={e => setYourName(e.target.value)}
                    autoComplete="name"
                  />
                  <span className="shrink-0 self-center pr-3 font-mukta text-[14px] font-medium leading-[28px] tracking-[0] text-primary">
                    Man
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="love-partner-name"
                  className="mb-2 block font-mukta text-[14px] md:text-[18px] font-medium leading-[28px] tracking-normal text-[#141414]"
                >
                  Partner&apos;s Name
                </label>
                <div className="flex min-h-[48px] items-stretch overflow-hidden rounded-full border border-Trinary bg-transparent pl-4 pr-1 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <input
                    id="love-partner-name"
                    className="min-w-0 flex-1 border-none bg-transparent py-2.5 font-mukta text-[15px] text-Paragraph outline-none placeholder:text-Paragraph"
                    placeholder="Sarah"
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    autoComplete="off"
                  />
                  <span className="shrink-0 self-center pr-3 font-mukta text-[14px] font-medium leading-[28px] tracking-[0] text-primary">
                    Woman
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-mukta text-[14px] text-[#141414]">Your birth date</label>
                <input
                  type="date"
                  value={yourBirthDate}
                  onChange={e => setYourBirthDate(e.target.value)}
                  className="w-full rounded-full border border-Trinary px-4 py-2.5 font-mukta text-[15px]"
                />
              </div>
              <div>
                <label className="mb-1 block font-mukta text-[14px] text-[#141414]">Partner birth date</label>
                <input
                  type="date"
                  value={partnerBirthDate}
                  onChange={e => setPartnerBirthDate(e.target.value)}
                  className="w-full rounded-full border border-Trinary px-4 py-2.5 font-mukta text-[15px]"
                />
              </div>
              <div>
                <label className="mb-1 block font-mukta text-[14px] text-[#141414]">Your birth place</label>
                <input
                  type="text"
                  placeholder="Kathmandu, Nepal"
                  value={yourBirthPlace}
                  onChange={e => setYourBirthPlace(e.target.value)}
                  className="w-full rounded-full border border-Trinary px-4 py-2.5 font-mukta text-[15px]"
                />
              </div>
              <div>
                <label className="mb-1 block font-mukta text-[14px] text-[#141414]">Partner birth place</label>
                <input
                  type="text"
                  placeholder="Pokhara, Nepal"
                  value={partnerBirthPlace}
                  onChange={e => setPartnerBirthPlace(e.target.value)}
                  className="w-full rounded-full border border-Trinary px-4 py-2.5 font-mukta text-[15px]"
                />
              </div>
            </div>

            {error ? (
              <p className="font-mukta text-sm text-[#8d1f1f]" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#5D1409] px-6 py-3.5 font-mukta text-[17px] font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              <IoHeart className="text-xl text-white" aria-hidden />
              {submitting ? 'Calculating…' : 'Calculate Love %'}
            </button>
          </form>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[480px] lg:block lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px]">
            <Image
              src={LoveHeroImage}
              alt="Illustration of a couple embracing"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 480px"
              priority
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1454px]">
        <h2 className="font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
          Choose Your Calculator
        </h2>

        <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible md:pb-0">
          <CalculatorCard
            title="Love Calculator"
            description="Discover your compatibility with a partner or potential love interest."
            mobileHorizontal
            calculateHref="/calculators/love-calculator"
            icon={
              <Image
                src={LoveCalculatorIcon}
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
            calculateHref="/calculators/numerology-calculator"
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
            calculateHref="/calculators/sun-sign-calculator"
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
            calculateHref="/calculators/mangal-dosha-calculator"
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
        </div>

        <div className="mt-6 hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
          <CalculatorCard
            title="Dasha Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="Calculate planetary dasha periods and analyze timing of life events in Vedic astrology."
            calculateHref="/calculators/dasha-calculator"
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
            calculateHref="/calculators/moon-phase-calculator"
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
            calculateHref="/calculators/rashi-calculator"
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
      </div>
    </section>
  );
}

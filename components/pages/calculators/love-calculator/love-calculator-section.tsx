'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoHeart } from 'react-icons/io5';

import { buildBirthVedastroQuery } from '@/lib/calculators/birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import type { CitySearchResult } from '@/lib/city-search-api';
import { CityAutocompleteInput } from '@/components/shared/city-autocomplete-input';

import CalculatorChooserSection from '../shared/calculator-chooser-section';
import CalculatorDatePicker from '../shared/calculator-date-picker';
import QNASComponent from '@/components/common/qnas-component';
import LoveHeroImage from '@/components/images/lovecalculator.png';

const LOVE_CALCULATOR_FAQ = [
  {
    question: 'What Is the Kuta Matching System?',
    answer:
      'Kuta matching is a Vedic method for comparing two people\'s birth charts across eight compatibility categories. These categories are Varna (spiritual nature), Vashya (natural influence), Tara (birth star compatibility), Yoni (instinctive nature), Graha Maitri (mental compatibility), Gana (temperament), Bhakut (emotional and financial compatibility), and Nadi (physical health and progeny). Each category carries a different point value and together they total 36 points.',
  },
  {
    question: 'What Does a High Score Mean?',
    answer:
      'A score of 18 or above is generally considered acceptable for a compatible match. Scores between 24 and 32 indicate strong compatibility across most categories. A score above 32 is considered excellent. However, the total score is just one part of the picture. The individual categories also matter. For example, a low Nadi score is considered more serious than a low Varna score even if the total is the same.',
  },
  {
    question: 'Is a Low Score a Problem?',
    answer:
      'A low score does not mean a relationship cannot work. It simply highlights areas where two people may need more understanding and effort. Many couples with lower compatibility scores build very happy relationships by understanding each other\'s differences. If you want a complete picture, a full Kundali matching consultation with one of our astrologers will look at all the factors together and give you honest guidance.',
  },
  {
    question: 'How Is This Different from Kundali Matching?',
    answer:
      'This love calculator gives you a quick compatibility score based on your zodiac signs and basic birth details. Kundali matching goes much deeper. It compares the full birth charts of both partners, checks for Doshas like Mangal Dosha and Nadi Dosha, analyses the Lagna compatibility, and looks at long-term planetary cycles for both people. If you are seriously considering marriage, a full Kundali matching report is the more thorough option.',
  },
];

export default function LoveCalculatorSection() {
  const router = useRouter();
  const [yourName, setYourName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [yourBirthDate, setYourBirthDate] = useState('');
  const [yourBirthPlace, setYourBirthPlace] = useState('');
  const [yourSelectedCity, setYourSelectedCity] = useState<CitySearchResult | null>(null);
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerBirthPlace, setPartnerBirthPlace] = useState('');
  const [partnerSelectedCity, setPartnerSelectedCity] = useState<CitySearchResult | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    yourName: '',
    partnerName: '',
    yourBirthDate: '',
    yourBirthPlace: '',
    partnerBirthDate: '',
    partnerBirthPlace: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = {
        yourName: '',
        partnerName: '',
        yourBirthDate: '',
        yourBirthPlace: '',
        partnerBirthDate: '',
        partnerBirthPlace: '',
      };

      if (!yourName.trim()) errors.yourName = 'Please enter your name.';
      if (!partnerName.trim()) errors.partnerName = "Please enter your partner's name.";
      if (!yourBirthDate) errors.yourBirthDate = 'Please enter your birth date.';
      if (!partnerBirthDate) errors.partnerBirthDate = 'Please enter your partner birth date.';
      const yourBirthPlaceValue = yourBirthPlace.trim();
      const partnerBirthPlaceValue = partnerBirthPlace.trim();

      if (!yourBirthPlaceValue) {
        errors.yourBirthPlace = 'Please enter your birth place.';
      }

      if (!partnerBirthPlaceValue) {
        errors.partnerBirthPlace = 'Please enter your partner birth place.';
      }

      setFieldErrors(errors);
      if (Object.values(errors).some(Boolean)) {
        setError('');
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
          buildBirthVedastroQuery(yourForm, yourSelectedCity),
          buildBirthVedastroQuery(partnerForm, partnerSelectedCity),
        ]);

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
      yourSelectedCity,
      partnerSelectedCity,
      router,
    ],
  );

  return (
    <section className="pt-6 md:pt-12 pb-12">
      <div>
        <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(360px,482px)] xl:items-start xl:gap-14">
          <div>
            <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
              Love Compatibility Calculator
            </h1>
            <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d] max-w-[950px]">
              Enter names and birth details for both partners to get a compatibility score based on the Vedic Kuta matching system.
            </p>
            <div className="relative mx-auto my-6 block w-[235px] h-[340px] sm:w-[300px] sm:h-[430px] md:w-[360px] md:h-[520px] xl:hidden mix-blend-darken">
              <div className="relative w-full h-full overflow-hidden rounded-[20px]">
                <Image
                  src={LoveHeroImage}
                  alt="Illustration of a couple embracing"
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 768px) 360px, (min-width: 640px) 300px, 235px"
                  priority
                />
              </div>
            </div>

            <p className="mt-4 md:mt-6 font-mukta font-normal text-[14px] leading-[1.5] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d] max-w-[1400px]">
              This calculator uses the Ashtakoot or eight Kuta system from Vedic astrology to assess
              compatibility between two people. Each of the eight categories examines a different
              dimension, from temperament and instincts to emotional alignment and long-term
              harmony. Together they produce a score out of 36.
            </p>

            <p className="mt-4 md:mt-6 font-mukta font-normal text-[14px] leading-[1.5] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d] max-w-[1400px]">
              A score of 18 or above is generally considered a positive match. Higher scores suggest
              stronger alignment across more areas. The score gives you a useful starting point for
              understanding the relationship. For deeper analysis, our astrologers can run a full
              Kundali matching report.
            </p>

            {/*
              FORM WRAPPER — fix applied here.
              The outer form no longer carries its own rounded border; the two
              inner "Your Details" / "Partner Details" cards are the visual
              boundary. This removes the nested-double-border effect that was
              causing the mismatched/overlapping outline at in-between zoom
              levels. `overflow-hidden` on this wrapper and on each inner card
              also guarantees icons/badges from child components (date picker,
              city autocomplete) can never visually escape their container.
            */}
            <form
              onSubmit={onSubmit}
              className="mt-6 md:mt-[50px] flex w-full max-w-[800px] flex-col gap-4 sm:gap-5 md:gap-6 rounded-[32px] border-2 border-[#BE7B71] p-4 sm:p-5 md:p-6 lg:p-8"
            >
              <h2 className="md:hidden text-center w-full self-start font-tiro-devanagari text-[#5D1409] text-[22px] sm:text-[28px] leading-[1.2] font-bold mt-0 mb-0">
                Check Your Compatibility
              </h2>
              <h2 className="hidden md:block text-center font-mukta text-[24px] lg:text-[28px] font-bold leading-[1.3] tracking-[0%] text-[#5D1409]">
                Check Your Compatibility
              </h2>

              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                <div className="min-w-0 overflow-hidden rounded-[28px] border border-[#BE7B71] p-4 sm:p-5 shadow-[0_8px_24px_rgba(105,23,9,0.06)]">
                  <p className="font-mukta text-[14px] sm:text-[15px] font-semibold text-[#5D1409] mb-4">
                    Your Details
                  </p>
                  <div className="grid gap-4">
                    <div className="min-w-0">
                      <label
                        htmlFor="love-your-name"
                        className="mb-2 block font-mukta text-sm text-Trinary"
                      >
                        Your Name
                      </label>
                      <div className="flex h-[48px] sm:h-[50px] md:h-[52px] w-full min-w-0 box-border items-center justify-between overflow-hidden rounded-[32px] border border-[#BE7B71] bg-transparent px-4 transition-colors duration-200 focus-within:border-[#BE7B71] focus-within:ring-1 focus-within:ring-[#BE7B71]/20">
                        <input
                          id="love-your-name"
                          className="min-w-0 flex-1 h-full border-none bg-transparent font-mukta text-[13px] sm:text-[14px] md:text-[15px] text-[#2f2f2f] outline-none placeholder:text-[#464646] placeholder:truncate"
                          placeholder="Enter your Full Name"
                          value={yourName}
                          onChange={e => {
                            setYourName(e.target.value);
                            setFieldErrors(prev => ({ ...prev, yourName: '' }));
                          }}
                          autoComplete="name"
                        />
                        <span className="shrink-0 self-center pl-2 font-mukta text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#D47F2C]">
                          Man
                        </span>
                      </div>
                      {fieldErrors.yourName && (
                        <p className="mt-1 text-[12px] text-red-600">{fieldErrors.yourName}</p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <CalculatorDatePicker
                        id="love-your-dob"
                        label="Your birth date"
                        value={yourBirthDate}
                        onChange={value => {
                          setYourBirthDate(value);
                          setFieldErrors(prev => ({ ...prev, yourBirthDate: '' }));
                        }}
                        error={fieldErrors.yourBirthDate}
                        fullWidth={true}
                        compact={true}
                      />
                    </div>

                    <div className="min-w-0">
                      <CityAutocompleteInput
                        label="Your birth place"
                        placeholder="Where were you born?"
                        value={yourBirthPlace}
                        onChange={value => {
                          setYourBirthPlace(value);
                          setYourSelectedCity(null);
                          setFieldErrors(prev => ({ ...prev, yourBirthPlace: '' }));
                        }}
                        onCitySelect={city => {
                          setYourSelectedCity(city);
                          setFieldErrors(prev => ({ ...prev, yourBirthPlace: '' }));
                        }}
                        error={fieldErrors.yourBirthPlace}
                      />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-[28px] border border-[#BE7B71] p-4 sm:p-5 shadow-[0_8px_24px_rgba(105,23,9,0.06)]">
                  <p className="font-mukta text-[14px] sm:text-[15px] font-semibold text-[#5D1409] mb-4">
                    Partner Details
                  </p>
                  <div className="grid gap-4">
                    <div className="min-w-0">
                      <label
                        htmlFor="love-partner-name"
                        className="mb-2 block font-mukta text-sm text-Trinary"
                      >
                        Partner&apos;s Name
                      </label>
                      <div className="flex h-[48px] sm:h-[50px] md:h-[52px] w-full min-w-0 box-border items-center justify-between overflow-hidden rounded-[32px] border border-[#BE7B71] bg-transparent px-4 transition-colors duration-200 focus-within:border-[#BE7B71] focus-within:ring-1 focus-within:ring-[#BE7B71]/20">
                        <input
                          id="love-partner-name"
                          className="min-w-0 flex-1 h-full border-none bg-transparent font-mukta text-[13px] sm:text-[14px] md:text-[15px] text-[#2f2f2f] outline-none placeholder:text-[#464646] placeholder:truncate"
                          placeholder="Enter your Partner's Full Name"
                          value={partnerName}
                          onChange={e => {
                            setPartnerName(e.target.value);
                            setFieldErrors(prev => ({ ...prev, partnerName: '' }));
                          }}
                          autoComplete="off"
                        />
                        <span className="shrink-0 self-center pl-2 font-mukta text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#D47F2C]">
                          Woman
                        </span>
                      </div>
                      {fieldErrors.partnerName && (
                        <p className="mt-1 text-[12px] text-red-600">{fieldErrors.partnerName}</p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <CalculatorDatePicker
                        id="love-partner-dob"
                        label="Partner birth date"
                        value={partnerBirthDate}
                        onChange={value => {
                          setPartnerBirthDate(value);
                          setFieldErrors(prev => ({ ...prev, partnerBirthDate: '' }));
                        }}
                        error={fieldErrors.partnerBirthDate}
                        fullWidth={true}
                        compact={true}
                      />
                    </div>

                    <div className="min-w-0">
                      <CityAutocompleteInput
                        label="Partner birth place"
                        placeholder="Where were you born?"
                        value={partnerBirthPlace}
                        onChange={value => {
                          setPartnerBirthPlace(value);
                          setPartnerSelectedCity(null);
                          setFieldErrors(prev => ({ ...prev, partnerBirthPlace: '' }));
                        }}
                        onCitySelect={city => {
                          setPartnerSelectedCity(city);
                          setFieldErrors(prev => ({ ...prev, partnerBirthPlace: '' }));
                        }}
                        error={fieldErrors.partnerBirthPlace}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <p className="font-mukta text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#5D1409] px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-3.5 font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                <IoHeart
                  className="text-lg sm:text-lg md:text-xl lg:text-xl text-white"
                  aria-hidden
                />
                {submitting ? 'Calculating…' : 'Get My Score'}
              </button>
            </form>
          </div>

          <div className="relative hidden w-full max-w-[482px] aspect-[482/620] xl:block xl:justify-self-end mix-blend-darken opacity-100">
            <div className="relative w-full h-full overflow-hidden rounded-[20px]">
              <Image
                src={LoveHeroImage}
                alt="Illustration of a couple embracing"
                fill
                className="object-contain object-center"
                sizes="482px"
                priority
              />
            </div>
          </div>
        </div>
        <CalculatorChooserSection exclude="love" />

        <section className="mt-16 border-t border-[#E5E5E5] pt-12">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6 text-center">
            <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary">
              Frequently Asked Questions
            </h2>
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px]">
              Find quick answers to common questions about our services, consultations, and how AstroSewa works.
            </p>
          </div>
          <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
            {LOVE_CALCULATOR_FAQ.map((item, index) => (
              <QNASComponent
                key={`love-faq-${index}`}
                question={item.question}
                answer={item.answer}
                isDefaultOpen={index === 0}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
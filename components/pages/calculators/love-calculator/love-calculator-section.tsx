'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoHeart } from 'react-icons/io5';

import { buildBirthVedastroQuery } from '@/lib/calculators/birth-query';
import { searchPlaceSuggestions, type GeocodeResult } from '@/lib/calculators/geocode-place';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';

import CalculatorChooserSection from '../shared/calculator-chooser-section';
import CalculatorDatePicker from '../shared/calculator-date-picker';
import LoveHeroImage from '@/components/images/lovecalculator.png';

export default function LoveCalculatorSection() {
  const router = useRouter();
  const [yourName, setYourName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [yourBirthDate, setYourBirthDate] = useState('');
  const [yourBirthPlace, setYourBirthPlace] = useState('');
  const [yourBirthPlaceSuggestions, setYourBirthPlaceSuggestions] = useState<GeocodeResult[]>([]);
  const [yourBirthPlaceSelection, setYourBirthPlaceSelection] = useState<GeocodeResult | null>(null);
  const [yourBirthPlaceSelected, setYourBirthPlaceSelected] = useState(false);
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerBirthPlace, setPartnerBirthPlace] = useState('');
  const [partnerBirthPlaceSuggestions, setPartnerBirthPlaceSuggestions] = useState<GeocodeResult[]>([]);
  const [partnerBirthPlaceSelection, setPartnerBirthPlaceSelection] = useState<GeocodeResult | null>(null);
  const [partnerBirthPlaceSelected, setPartnerBirthPlaceSelected] = useState(false);
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

  useEffect(() => {
    if (!yourBirthPlace.trim() || yourBirthPlaceSelected) {
      setYourBirthPlaceSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const suggestions = await searchPlaceSuggestions(yourBirthPlace, 5);
      setYourBirthPlaceSuggestions(suggestions);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [yourBirthPlace, yourBirthPlaceSelected]);

  useEffect(() => {
    if (!partnerBirthPlace.trim() || partnerBirthPlaceSelected) {
      setPartnerBirthPlaceSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const suggestions = await searchPlaceSuggestions(partnerBirthPlace, 5);
      setPartnerBirthPlaceSuggestions(suggestions);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [partnerBirthPlace, partnerBirthPlaceSelected]);

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
      if (!yourBirthPlace.trim()) {
        errors.yourBirthPlace = 'Please enter your birth place.';
      } else if (!yourBirthPlaceSelected || !yourBirthPlaceSelection) {
        errors.yourBirthPlace = 'Please select a valid birth place from the suggestions.';
      }
      if (!partnerBirthPlace.trim()) {
        errors.partnerBirthPlace = 'Please enter your partner birth place.';
      } else if (!partnerBirthPlaceSelected || !partnerBirthPlaceSelection) {
        errors.partnerBirthPlace = 'Please select a valid birth place from the suggestions.';
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
          buildBirthVedastroQuery(yourForm, yourBirthPlaceSelection ?? undefined),
          buildBirthVedastroQuery(partnerForm, partnerBirthPlaceSelection ?? undefined),
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
      yourBirthPlaceSelected,
      yourBirthPlaceSelection,
      partnerBirthPlaceSelected,
      partnerBirthPlaceSelection,
      router,
    ],
  );

  return (
    <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
      <div className="max-w-[1454px] mx-auto">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,640px)] lg:gap-14 xl:gap-20">
          <div>
            <h1 className="font-sahitya font-bold text-[30px] md:text-[36px] lg:text-[44px] leading-[1.1] text-primary">
              Love Calculator
            </h1>
            <p className="mt-2 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.7] text-[#141414] max-w-[950px]">
              Discover how compatible you are with your partner using Astro Sewa’s Vedic love
              calculator.
            </p>
            <p className="mt-6 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.8] text-Paragraph max-w-[1200px]">
              Enter your names, birth dates and birth places to get a compatibility score based on
              VedAstro MatchReport and our love calculator algorithm.
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
              Compatibility score from VedAstro MatchReport (Kuta / Guna-style matching). Enter
              names and birth date + place for both people.
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
              className="mt-8 flex w-full max-w-[632px] sm:max-w-[680px] md:max-w-[720px] lg:max-w-[800px] flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 rounded-[14px] sm:rounded-[16px] md:rounded-[18px] lg:rounded-[20px] border border-Trinary bg-transparent p-4 sm:p-5 md:p-6 lg:p-8"
            >
              <h2 className="text-center font-mukta text-[18px] sm:text-[22px] md:text-[26px] lg:text-[28px] font-bold leading-[26px] sm:leading-[30px] md:leading-[34px] lg:leading-[38px] tracking-[0%] text-[#5D1409]">
                Find Your Love % Between You And Your Partner.
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
                <div>
                  <label
                    htmlFor="love-your-name"
                    className="mb-2 block font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[28px] tracking-normal text-[#141414]"
                  >
                    Your Name
                  </label>
                  <div className="flex min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] items-stretch overflow-hidden rounded-full border border-Trinary bg-transparent pl-3 sm:pl-4 lg:pl-5 pr-1 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <input
                      id="love-your-name"
                      className="min-w-0 flex-1 border-none bg-transparent py-2 sm:py-2.5 md:py-3 lg:py-3.5 font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-Paragraph outline-none placeholder:text-Paragraph"
                      placeholder="Rupak"
                      value={yourName}
                      onChange={e => {
                        setYourName(e.target.value);
                        setFieldErrors(prev => ({ ...prev, yourName: '' }));
                      }}
                      autoComplete="name"
                    />
                    <span className="shrink-0 self-center pr-2 sm:pr-3 lg:pr-4 font-mukta text-[12px] sm:text-[13px] md:text-[14px] font-medium leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[28px] tracking-[0] text-primary">
                      Man
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-red-600 min-h-[18px]">
                    {fieldErrors.yourName || '\u00a0'}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="love-partner-name"
                    className="mb-2 block font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[28px] tracking-normal text-[#141414]"
                  >
                    Partner&apos;s Name
                  </label>
                  <div className="flex min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] items-stretch overflow-hidden rounded-full border border-Trinary bg-transparent pl-3 sm:pl-4 lg:pl-5 pr-1 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <input
                      id="love-partner-name"
                      className="min-w-0 flex-1 border-none bg-transparent py-2 sm:py-2.5 md:py-3 lg:py-3.5 font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-Paragraph outline-none placeholder:text-Paragraph"
                      placeholder="Sarah"
                      value={partnerName}
                      onChange={e => {
                        setPartnerName(e.target.value);
                        setFieldErrors(prev => ({ ...prev, partnerName: '' }));
                      }}
                      autoComplete="off"
                    />
                    <span className="shrink-0 self-center pr-2 sm:pr-3 lg:pr-4 font-mukta text-[12px] sm:text-[13px] md:text-[14px] font-medium leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[28px] tracking-[0] text-primary">
                      Woman
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-red-600 min-h-[18px]">
                    {fieldErrors.partnerName || '\u00a0'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
                <div>
                  <CalculatorDatePicker
                    id="love-your-dob"
                    label="Your birth date"
                    value={yourBirthDate}
                    onChange={value => {
                      setYourBirthDate(value);
                      setFieldErrors(prev => ({ ...prev, yourBirthDate: '' }));
                    }}
                    error={fieldErrors.yourBirthDate}
                  />
                </div>
                <div>
                  <CalculatorDatePicker
                    id="love-partner-dob"
                    label="Partner birth date"
                    value={partnerBirthDate}
                    onChange={value => {
                      setPartnerBirthDate(value);
                      setFieldErrors(prev => ({ ...prev, partnerBirthDate: '' }));
                    }}
                    error={fieldErrors.partnerBirthDate}
                  />
                </div>
                <div>
                  <label className="mb-1.5 sm:mb-2 block font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#141414]">
                    Your birth place
                  </label>
                  <input
                    type="text"
                    placeholder="Where were you born?"
                    value={yourBirthPlace}
                    onChange={e => {
                      setYourBirthPlace(e.target.value);
                      setYourResolvedBirthPlace('');
                      setYourBirthPlaceSelection(null);
                      setYourBirthPlaceSelected(false);
                      setFieldErrors(prev => ({ ...prev, yourBirthPlace: '' }));
                    }}
                    className="w-full rounded-full border border-Trinary px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]"
                  />
                  {yourBirthPlaceSuggestions.length > 0 && !yourBirthPlaceSelected ? (
                    <div className="mt-2 max-h-44 overflow-auto rounded-2xl border border-Trinary bg-white shadow-lg z-10">
                      {yourBirthPlaceSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                          type="button"
                          onClick={() => {
                            setYourBirthPlace(suggestion.displayName ?? yourBirthPlace);
                            setYourResolvedBirthPlace(suggestion.displayName ?? '');
                            setYourBirthPlaceSelection(suggestion);
                            setYourBirthPlaceSelected(true);
                            setYourBirthPlaceSuggestions([]);
                            setFieldErrors(prev => ({ ...prev, yourBirthPlace: '' }));
                          }}
                          className="w-full text-left px-3 py-2 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] hover:bg-slate-100"
                        >
                          {suggestion.displayName}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-1 text-[12px] text-red-600 min-h-[18px]">
                    {fieldErrors.yourBirthPlace || ' '}
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 sm:mb-2 block font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#141414]">
                    Partner birth place
                  </label>
                  <input
                    type="text"
                    placeholder="Where were you born?"
                    value={partnerBirthPlace}
                    onChange={e => {
                      setPartnerBirthPlace(e.target.value);
                      setPartnerResolvedBirthPlace('');
                      setPartnerBirthPlaceSelection(null);
                      setPartnerBirthPlaceSelected(false);
                      setFieldErrors(prev => ({ ...prev, partnerBirthPlace: '' }));
                    }}
                    className="w-full rounded-full border border-Trinary px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]"
                  />
                  {partnerBirthPlaceSuggestions.length > 0 && !partnerBirthPlaceSelected ? (
                    <div className="mt-2 max-h-44 overflow-auto rounded-2xl border border-Trinary bg-white shadow-lg z-10">
                      {partnerBirthPlaceSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                          type="button"
                          onClick={() => {
                            setPartnerBirthPlace(suggestion.displayName ?? partnerBirthPlace);
                            setPartnerResolvedBirthPlace(suggestion.displayName ?? '');
                            setPartnerBirthPlaceSelection(suggestion);
                            setPartnerBirthPlaceSelected(true);
                            setPartnerBirthPlaceSuggestions([]);
                            setFieldErrors(prev => ({ ...prev, partnerBirthPlace: '' }));
                          }}
                          className="w-full text-left px-3 py-2 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] hover:bg-slate-100"
                        >
                          {suggestion.displayName}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-1 text-[12px] text-red-600 min-h-[18px]">
                    {fieldErrors.partnerBirthPlace || ' '}
                  </p>
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
                className="flex min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#5D1409] px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-3.5 font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                <IoHeart
                  className="text-lg sm:text-lg md:text-xl lg:text-xl text-white"
                  aria-hidden
                />
                {submitting ? 'Calculating…' : 'Calculate Love %'}
              </button>
            </form>
          </div>

          <div className="relative mx-auto hidden w-full lg:block lg:mx-0">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px]">
              <Image
                src={LoveHeroImage}
                alt="Illustration of a couple embracing"
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority
              />
            </div>
          </div>
        </div>
        <CalculatorChooserSection exclude="love" />
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoHeart } from 'react-icons/io5';

import { buildBirthVedastroQuery } from '@/lib/calculators/birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';

import CalculatorCard from '../calculator-card';
import CalculatorChooserSection from '../shared/calculator-chooser-section';
import CalculatorDatePicker from '../shared/calculator-date-picker';
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
  const [yourResolvedBirthPlace, setYourResolvedBirthPlace] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerBirthPlace, setPartnerBirthPlace] = useState('');
  const [partnerResolvedBirthPlace, setPartnerResolvedBirthPlace] = useState('');
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
      if (!yourBirthPlace.trim()) {
        errors.yourBirthPlace = 'Please enter your birth place.';
      }
      if (!partnerBirthPlace.trim()) {
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
          buildBirthVedastroQuery(yourForm),
          buildBirthVedastroQuery(partnerForm),
        ]);

        setYourResolvedBirthPlace(yourQ.resolvedLocation ?? yourBirthPlace.trim());
        setPartnerResolvedBirthPlace(partnerQ.resolvedLocation ?? partnerBirthPlace.trim());

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
    <section className="container mx-auto px-6 lg:px-0 pt-6 md:pt-12 pb-12">
      <div className="max-w-[1454px] mx-auto">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,482px)] lg:gap-10 xl:gap-14">
          <div>
            <h1 className="font-sahitya font-bold text-[22px] leading-[32px] md:text-[36px] md:leading-[48px] tracking-[0] text-primary">
              Love Calculator
            </h1>
            <p className="mt-2 font-mukta font-normal text-[12px] leading-[20px] tracking-[0] capitalize md:text-lg lg:font-medium lg:text-[24px] lg:leading-[30px] lg:tracking-[0] text-[#141414] max-w-[950px]">
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

            <p className="mt-6 font-mukta font-normal text-base leading-relaxed tracking-[0] text-Paragraph max-w-[1400px] md:text-[24px] md:leading-[34px] md:tracking-[0]">
              A love calculator is a fun, easy way to discover your "love score" and see how well you connect. Simply enter your names and let the results surprise you!
            </p>

            <p className="mt-4 font-mukta font-normal text-base leading-relaxed tracking-[0] text-Paragraph max-w-[1400px] md:text-[24px] md:leading-[34px] md:tracking-[0]">
              Finding love can be challenging, but tools like the love calculator add excitement to the journey. They give you a playful peek into your feelings and compatibility before taking the next step. Many people use it just for fun, while others explore it to understand their bond better. Try it now and see what the stars reveal about your connection!
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-6 flex w-full max-w-[632px] sm:max-w-[680px] md:max-w-[720px] lg:max-w-[800px] flex-col gap-4 rounded-[32px] border border-[#BE7B71] p-4 sm:p-5 md:p-6 lg:p-8 shadow-[0_10px_30px_rgba(105,23,9,0.08)]"
            >
              <h2 className="md:hidden text-center w-full self-start font-sahitya text-[#5D1409] text-[22px] sm:text-[28px] leading-[32px] font-bold mt-0 mb-0">
                Find Your Love % Between You And Your Partner.
              </h2>
              <h2 className="hidden md:block text-center font-mukta text-[28px] font-bold leading-[38px] tracking-[0%] text-[#5D1409]">
                Find Your Love % Between You And Your Partner.
              </h2>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[32px] border border-[#BE7B71] p-4 sm:p-5 shadow-[0_8px_24px_rgba(105,23,9,0.08)]">
                  <p className="font-mukta text-[15px] font-semibold text-[#5D1409] mb-4">
                    Your Details
                  </p>
                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="love-your-name"
                        className="mb-2 block font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-[#141414]"
                      >
                        Your Name
                      </label>
                      <div className="flex h-[52px] box-border items-center justify-between overflow-hidden rounded-[32px] border border-[#BE7B71] bg-transparent px-[16px] transition-colors duration-200 focus-within:border-[#BE7B71] focus-within:ring-1 focus-within:ring-[#BE7B71]/20">
                        <input
                          id="love-your-name"
                          className="min-w-0 flex-1 h-full border-none bg-transparent font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-[#2f2f2f] outline-none placeholder:text-[#464646]"
                          placeholder="Rupak"
                          value={yourName}
                          onChange={e => {
                            setYourName(e.target.value);
                            setFieldErrors(prev => ({ ...prev, yourName: '' }));
                          }}
                          autoComplete="name"
                        />
                        <span className="shrink-0 self-center pr-2 sm:pr-3 lg:pr-4 font-mukta text-[12px] sm:text-[13px] md:text-[14px] font-medium text-[#D47F2C]">
                          Man
                        </span>
                      </div>
                      {fieldErrors.yourName && (
                        <p className="mt-1 text-[12px] text-red-600">{fieldErrors.yourName}</p>
                      )}
                    </div>

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
                        fullWidth={true}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#141414]">
                        Your birth place
                      </label>
                      <input
                        type="text"
                        placeholder="Where were you born?"
                        value={yourBirthPlace}
                        onChange={e => {
                          setYourBirthPlace(e.target.value);
                          setYourResolvedBirthPlace('');
                          setFieldErrors(prev => ({ ...prev, yourBirthPlace: '' }));
                        }}
                        className="w-full h-[52px] box-border rounded-[32px] border border-[#BE7B71] bg-transparent px-[16px] py-[12px] font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#2f2f2f] placeholder:text-[#464646]"
                      />
                      {fieldErrors.yourBirthPlace && (
                        <p className="mt-1 text-[12px] text-red-600">{fieldErrors.yourBirthPlace}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-[#BE7B71] p-4 sm:p-5 shadow-[0_8px_24px_rgba(105,23,9,0.08)]">
                  <p className="font-mukta text-[15px] font-semibold text-[#5D1409] mb-4">
                    Partner Details
                  </p>
                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="love-partner-name"
                        className="mb-2 block font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-[#141414]"
                      >
                        Partner&apos;s Name
                      </label>
                      <div className="flex h-[52px] box-border items-center justify-between overflow-hidden rounded-[32px] border border-[#BE7B71] bg-transparent px-[16px] transition-colors duration-200 focus-within:border-[#BE7B71] focus-within:ring-1 focus-within:ring-[#BE7B71]/20">
                        <input
                          id="love-partner-name"
                          className="min-w-0 flex-1 h-full border-none bg-transparent font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-[#2f2f2f] outline-none placeholder:text-[#464646]"
                          placeholder="Sarah"
                          value={partnerName}
                          onChange={e => {
                            setPartnerName(e.target.value);
                            setFieldErrors(prev => ({ ...prev, partnerName: '' }));
                          }}
                          autoComplete="off"
                        />
                        <span className="shrink-0 self-center pr-2 sm:pr-3 lg:pr-4 font-mukta text-[12px] sm:text-[13px] md:text-[14px] font-medium text-[#D47F2C]">
                          Woman
                        </span>
                      </div>
                      {fieldErrors.partnerName && (
                        <p className="mt-1 text-[12px] text-red-600">{fieldErrors.partnerName}</p>
                      )}
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
                        fullWidth={true}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#141414]">
                        Partner birth place
                      </label>
                      <input
                        type="text"
                        placeholder="Where were you born?"
                        value={partnerBirthPlace}
                        onChange={e => {
                          setPartnerBirthPlace(e.target.value);
                          setPartnerResolvedBirthPlace('');
                          setFieldErrors(prev => ({ ...prev, partnerBirthPlace: '' }));
                        }}
                        className="w-full h-[52px] box-border rounded-[32px] border border-[#BE7B71] bg-transparent px-[16px] py-[12px] font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#2f2f2f] placeholder:text-[#464646]"
                      />
                      {fieldErrors.partnerBirthPlace && (
                        <p className="mt-1 text-[12px] text-red-600">{fieldErrors.partnerBirthPlace}</p>
                      )}
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
                {submitting ? 'Calculating…' : 'Calculate Love %'}
              </button>
            </form>
          </div>

          <div className="relative hidden w-[482px] h-[740px] lg:block lg:-translate-y-20 mix-blend-darken opacity-100">
            <div className="relative w-full h-full overflow-hidden rounded-[20px]">
              <Image
                src={LoveHeroImage}
                alt="Illustration of a couple embracing"
                fill
                className="object-contain object-center"
                sizes="511px"
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

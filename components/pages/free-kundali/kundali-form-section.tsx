'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { IoLocationOutline } from 'react-icons/io5';
import { LuClock } from 'react-icons/lu';

import CalendarIcon from '@/components/icons/calendar-icon';
import UserLineIcon from '@/components/icons/user/user-line';
import ChevronDownIcon from '@/components/icons/chevron-down';
import { ServiceReport } from '@/components/images/services';
import GoogleGIcon from '@/components/images/icons/google_G.png';

const fieldIconClass = 'w-5 h-5 md:w-6 md:h-6 shrink-0 text-primary';
const cardShell = clsx(
  'w-full box-border rounded-[32px] border px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8',
  'lg:px-[52px] lg:py-9',
);

const KundaliFormSection: React.FC = () => {
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault();

  return (
    <section className="w-full px-4 md:px-8">
      <div className="mx-auto w-full max-w-[2400px]">
        <div className="flex flex-col lg:block items-center">
          {/* Right Card - Mobile Only */}
          <div
            className={clsx(
              'w-full max-w-[398px] h-[392px] box-border rounded-[40px] border border-primary bg-primary text-[#f7e9dd] p-4',
              'flex flex-col items-center justify-center text-center gap-4 shadow-[0_12px_34px_rgba(74,20,15,0.14)]',
              'lg:hidden relative -top-2',
            )}
          >
            <div className="relative w-full max-w-[220px] aspect-square rounded-[28px] p-5">
              <Image
                src={ServiceReport}
                alt="Astrologer illustration"
                fill
                className="object-contain filter brightness-0 invert"
                sizes="220px"
              />
            </div>
            <p className="font-sahitya text-[22px] md:text-[24px] leading-snug font-bold">
              View your saved Kundali
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-secondary px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white -translate-y-2"
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
              >
                <Image src={GoogleGIcon} alt="" width={24} height={24} />
              </span>
              Continue with Google
            </button>
          </div>

          {/* Mobile Title */}
          <h2 className="md:hidden text-left w-full self-start font-sahitya text-primary text-[22px] sm:text-[28px] leading-[32px] font-bold mt-6 mb-4">
            Fill up the Details Report
          </h2>

          {/* Tablet + Desktop Title */}
          <h2 className="hidden md:block font-sahitya text-left text-primary text-[28px] leading-[38px] tracking-[0] font-bold mt-6 mb-8 lg:mb-8">
            Fill Up The Form To Generate Birth Kundali
          </h2>

          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:w-full gap-6 lg:gap-6">
            {/* FORM */}
            <form
              onSubmit={onSubmit}
              className={clsx(
                'w-[398px] max-w-full h-auto box-border rounded-[40px] border border-Trinary p-2 gap-4 shadow-[0_12px_34px_rgba(74,20,15,0.12)] md:w-full md:max-w-none md:h-auto lg:px-12 lg:pt-10 lg:pb-5',
                'flex flex-col lg:w-full',
              )}
            >
              <div className="text-center border-b border-Trinary pb-1 md:pb-2 lg:pb-2 mb-5 md:mb-4 lg:mb-6 gap-10">
                <h3 className="font-sahitya text-primary text-[22px] leading-[32px] md:text-[28px] md:leading-[38px] font-bold tracking-[0]">
                  Generate Your Kundali
                </h3>
              </div>

              <fieldset className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-5 border-none p-0">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="kundali-full-name"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter full name
                  </label>
                  <div className="flex items-center gap-3 rounded-full border border-Trinary px-4 py-3 focus-within:border-primary">
                    <input
                      id="kundali-full-name"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none"
                    />
                    <UserLineIcon className={fieldIconClass} />
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label
                    htmlFor="kundali-dob"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter date of birth
                  </label>
                  <div className="flex items-center gap-3 rounded-full border border-Trinary px-4 py-3 focus-within:border-primary">
                    <input
                      id="kundali-dob"
                      name="dateOfBirth"
                      type="text"
                      placeholder="M / D / Y"
                      inputMode="numeric"
                      className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none"
                    />
                    <CalendarIcon className={fieldIconClass} />
                  </div>
                </div>

                {/* Birth Place */}
                <div>
                  <label
                    htmlFor="kundali-birth-place"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter birth place
                  </label>
                  <div className="flex items-center gap-3 rounded-full border border-Trinary px-4 py-3 focus-within:border-primary">
                    <input
                      id="kundali-birth-place"
                      name="birthPlace"
                      type="text"
                      placeholder="Kathmandu, Nepal"
                      className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none"
                    />
                    <IoLocationOutline className={fieldIconClass} aria-hidden />
                  </div>
                </div>

                {/* Birth Time */}
                <div>
                  <label
                    htmlFor="kundali-birth-time"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter birth time
                  </label>
                  <div
                    className={clsx(
                      'flex items-center gap-3 rounded-full border border-Trinary px-4 py-3 focus-within:border-primary',
                      unknownBirthTime && 'opacity-50 pointer-events-none',
                    )}
                  >
                    <input
                      id="kundali-birth-time"
                      name="birthTime"
                      type="text"
                      disabled={unknownBirthTime}
                      placeholder="hh / mm / am"
                      className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none disabled:cursor-not-allowed"
                    />
                    <LuClock className={fieldIconClass} aria-hidden />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label
                    htmlFor="kundali-gender"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Select gender
                  </label>
                  <div className="relative flex items-center gap-3 rounded-full border border-Trinary px-4 py-3 focus-within:border-primary">
                    <select
                      id="kundali-gender"
                      name="gender"
                      defaultValue=""
                      className="flex-1 min-w-0 appearance-none bg-transparent font-mukta text-sm md:text-base text-Paragraph outline-none cursor-pointer pr-10"
                    >
                      <option value="" disabled className="text-Paragraph">
                        Select
                      </option>
                      <option value="male" className="text-Paragraph">
                        Male
                      </option>
                      <option value="female" className="text-Paragraph">
                        Female
                      </option>
                      <option value="other" className="text-Paragraph">
                        Other
                      </option>
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c221d] pointer-events-none" />
                  </div>
                </div>
              </fieldset>

              {/* Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer font-mukta text-sm text-primary mt-2 lg:mt-8 lg:mb-4">
                <span
                  className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded-full border border-primary',
                    unknownBirthTime ? 'bg-primary' : 'bg-transparent',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={unknownBirthTime}
                    onChange={e => setUnknownBirthTime(e.target.checked)}
                    className="sr-only"
                  />
                  {unknownBirthTime && (
                    <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
                  )}
                </span>
                <span>Don&apos;t know my exact birth time</span>
              </label>

              <button
                type="submit"
                className="mt-3 md:mt-6 lg:-translate-y-3 w-full h-[60px] gap-8 rounded-full bg-[#6d1510] text-[18px] font-mukta font-semibold leading-[30px] text-secondary transition-colors hover:bg-[#8e2f27] flex items-center justify-center "
              >
                Generate Now
              </button>
            </form>

            {/* Right Card - Desktop Only */}
            <div
              className={clsx(
                cardShell,
                'border border-primary bg-primary text-[#f7e9dd]',
                'flex flex-col items-center justify-center text-center gap-6 shadow-[0_12px_34px_rgba(74,20,15,0.14)]',
                'w-full hidden lg:flex',
              )}
            >
              <div className="relative w-full max-w-[277.916px] aspect-square rounded-[28px] p-5">
                <Image
                  src={ServiceReport}
                  alt="Astrologer illustration"
                  fill
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <p className="font-sahitya text-[28px] md:text-[26px] leading-snug font-bold">
                View your saved Kundali
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-[#f8f1e7] px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white lg:rotate-0 lg:opacity-100"
              >
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
                >
                  <Image src={GoogleGIcon} alt="" width={24} height={24} />
                </span>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KundaliFormSection;

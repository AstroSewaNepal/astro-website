import React from 'react';
import Image from 'next/image';
import { ServiceReport } from '@/components/images/services';
import GoogleGIcon from '@/components/images/icons/google_G.png';

type InputProps = {
  label: string;
  placeholder?: string;
  rightIcon?: React.ReactNode;
  className?: string;
};

const InputPill = ({ label, placeholder, rightIcon, className }: InputProps) => {
  return (
    <label className={['block', className].filter(Boolean).join(' ')}>
      <span className="block font-mukta text-[12px] md:text-[13px] text-primary mb-1.5">
        {label}
      </span>
      <span className="relative block">
        <input
          placeholder={placeholder}
          className="w-full h-10 md:h-11 rounded-full border-2 border-primary bg-[#fbf5ec]/70 px-4 pr-10 font-mukta text-[13px] md:text-[14px] text-[#141414] placeholder:text-[#7b6b69] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        {rightIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary/70">
            {rightIcon}
          </span>
        ) : null}
      </span>
    </label>
  );
};

const SelectPill = ({ label, placeholder = 'Select', rightIcon, className }: InputProps) => {
  return (
    <label className={['block', className].filter(Boolean).join(' ')}>
      <span className="block font-mukta text-[12px] md:text-[13px] text-primary mb-1.5">
        {label}
      </span>
      <span className="relative block">
        <select className="w-full h-10 md:h-11 appearance-none rounded-full border-2 border-primary bg-[#fbf5ec]/70 px-4 pr-10 font-mukta text-[13px] md:text-[14px] text-[#141414] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
          <option value="">{placeholder}</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary/70">
          {rightIcon ?? (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    </label>
  );
};

const SectionPillHeader = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={[
        'w-full rounded-full bg-primary py-2 text-center shadow-[0_8px_24px_rgba(97,21,8,0.14)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </div>
  );
};

const KundaliMatchingFormSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto mt-6 md:mt-8">
      <h2 className="w-[287px] md:w-full md:text-center font-sahitya font-bold text-[20px] leading-[38px] md:text-[28px] md:leading-[38px] text-primary mb-4 md:mb-6 opacity-100">
        Fill Up The Form To Match Kundali
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
        <div className="w-full max-w-[380px] mx-auto lg:mx-0 lg:max-w-none lg:col-span-8 rounded-[32.41px] md:rounded-[32px] border-2 border-primary shadow-[0_10px_30px_rgba(97,21,8,0.08)] p-4 pb-[12.96px] md:p-6">
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-3 md:space-y-3.5">
                <SectionPillHeader
                  className="max-w-[397.649px] h-[61.573px] rounded-[32.41px] px-[19.44px] pt-[12.96px] pb-[12.96px] border-b-[0.81px] border-b-primary/50"
                  style={{ gap: '8px', opacity: 1 }}
                >
                  <span className="inline-flex items-center justify-center gap-2 font-sahitya font-bold text-[19.44px] leading-[30.79px] tracking-normal text-secondary">
                    Man
                    <span
                      aria-hidden
                      className="inline-flex items-center justify-center w-[27.29263687133789px] h-[27.29263687133789px] text-[27.29263687133789px] leading-none text-secondary/95 opacity-100"
                    >
                      ♂
                    </span>
                  </span>
                </SectionPillHeader>

                <InputPill
                  label="Enter full name"
                  placeholder="John Doe"
                  rightIcon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M20 21a8 8 0 10-16 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 13a4 4 0 100-8 4 4 0 000 8z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <InputPill
                    label="Enter date of birth"
                    placeholder="M / D / Y"
                    rightIcon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 3v3M16 3v3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4 9h16"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                  <InputPill
                    label="Enter birth place"
                    placeholder="Kathmandu, Nepal"
                    rightIcon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 21s7-4.4 7-11a7 7 0 10-14 0c0 6.6 7 11 7 11z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <InputPill
                    label="Enter birth time"
                    placeholder="hh / mm / am"
                    rightIcon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 22a10 10 0 100-20 10 10 0 000 20z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 6v6l4 2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                  <SelectPill label="Select gender" />
                </div>

                <label className="flex items-center gap-2 font-mukta text-[12px] md:text-[13px] text-Trinary mt-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-primary/40 focus:ring-primary/20"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Don&apos;t know my exact birth of time
                </label>

                <div
                  aria-hidden
                  className="md:hidden h-0 opacity-100 w-[calc(100%+32px)] -mx-4 mt-2"
                  style={{
                    borderTop: '1.62px dashed var(--primary)',
                    borderImage:
                      'repeating-linear-gradient(to right, var(--primary) 0 4.861026287078857px, transparent 4.861026287078857px 9.722052574157714px) 1',
                  }}
                />
              </div>

              <div className="space-y-3 md:space-y-3.5">
                <SectionPillHeader
                  className="max-w-[397.649px] h-[61.573px] rounded-[32.41px] px-[19.44px] pt-[12.96px] pb-[12.96px] border-b-[0.81px] border-b-primary/50"
                  style={{ gap: '8px', opacity: 1 }}
                >
                  <span className="inline-flex items-center justify-center gap-2 font-sahitya font-bold text-[19.44px] leading-[30.79px] tracking-normal text-secondary">
                    Woman
                    <span
                      aria-hidden
                      className="inline-flex items-center justify-center w-[27.29263687133789px] h-[27.29263687133789px] text-[27.29263687133789px] leading-none text-secondary/95 opacity-100"
                    >
                      ♀
                    </span>
                  </span>
                </SectionPillHeader>

                <InputPill
                  label="Enter full name"
                  placeholder="John Doe"
                  rightIcon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M20 21a8 8 0 10-16 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 13a4 4 0 100-8 4 4 0 000 8z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <InputPill
                    label="Enter date of birth"
                    placeholder="M / D / Y"
                    rightIcon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 3v3M16 3v3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4 9h16"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                  <InputPill
                    label="Enter birth place"
                    placeholder="Kathmandu, Nepal"
                    rightIcon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 21s7-4.4 7-11a7 7 0 10-14 0c0 6.6 7 11 7 11z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <InputPill
                    label="Enter birth time"
                    placeholder="hh / mm / am"
                    rightIcon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 22a10 10 0 100-20 10 10 0 000 20z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 6v6l4 2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                  <SelectPill label="Select gender" />
                </div>

                <label className="flex items-center gap-2 font-mukta text-[12px] md:text-[13px] text-Trinary mt-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-primary/40 focus:ring-primary/20"
                    style={{ accentColor: 'var(--primary)' }}
                    defaultChecked
                  />
                  Don&apos;t know my exact birth of time
                </label>
              </div>
            </div>

            <div className="hidden md:block absolute left-1/2 -top-6 bottom-0 w-px -translate-x-1/2 border-l border-dashed border-primary" />

            <div className="mt-5 md:mt-6 flex justify-center relative z-[1]">
              <button
                type="button"
                className="inline-flex w-[154.814px] h-[48.61px] items-center justify-center rounded-[25.93px] bg-primary pt-[12.96px] pr-[32.41px] pb-[12.96px] pl-[32.41px] font-mukta text-[14.58px] font-semibold leading-[24.31px] tracking-normal text-secondary shadow-[0_10px_26px_rgba(97,21,8,0.18)] transition-colors hover:bg-[#8e2f27]"
                style={{ gap: '8.1px', opacity: 1 }}
              >
                Generate Now
              </button>
            </div>
          </div>
        </div>

        <aside className="w-full max-w-[380px] h-[392px] mx-auto lg:mx-0 lg:max-w-none lg:h-auto lg:col-span-4 rounded-[40px] md:rounded-[32px] border border-primary bg-primary text-secondary shadow-[0_12px_34px_rgba(97,21,8,0.22)] p-4 md:p-7 flex flex-col items-center justify-center gap-4 md:gap-6">
          <div
            className="relative p-2"
            style={{
              width: '188.2345px',
              height: '220.7189px',
              opacity: 1,
            }}
          >
            <Image
              src={ServiceReport}
              alt="Astrologer illustration"
              fill
              className="object-contain filter brightness-0 invert"
              sizes="240px"
            />
          </div>

          <h3 className="font-sahitya font-bold text-[28px] leading-[38px] text-center">
            View your saved Kundali
          </h3>

          <button
            type="button"
            className="w-full max-w-[320px] inline-flex items-center justify-center gap-3 rounded-full bg-[#fbf5ec] px-5 py-2.5 md:py-3 font-mukta text-[14px] md:text-[15px] font-semibold text-primary shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:bg-white transition-colors"
          >
            <span
              aria-hidden
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
            >
              <Image src={GoogleGIcon} alt="" width={24} height={24} />
            </span>
            <span
              style={{
                fontFamily: 'Raleway',
                fontWeight: 600,
                fontSize: 20,
                lineHeight: '26px',
                letterSpacing: '0%',
              }}
            >
              Continue with Google
            </span>
          </button>
        </aside>
      </div>
    </section>
  );
};

export default KundaliMatchingFormSection;

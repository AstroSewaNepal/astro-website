'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoShareOutline } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';

import UploadPhotoImg from '@/components/images/uploadyourphoto.png';
import LoveMatchIcon from '@/components/images/icons/lovematch.png';

type LoveResult = {
  yourName: string;
  partnerName: string;
  score: number;
};

export default function LoveCalculatorResultSection() {
  const router = useRouter();
  const [result, setResult] = useState<LoveResult | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const raw = sessionStorage.getItem('loveCalculatorResult');
    if (raw) {
      let cancelled = false;
      try {
        const parsed = JSON.parse(raw) as LoveResult;
        queueMicrotask(() => {
          if (!cancelled) setResult(parsed);
        });
      } catch {
        queueMicrotask(() => {
          if (!cancelled) setResult(null);
        });
      }
      return () => {
        cancelled = true;
      };
    }
  }, []);

  const handleCalculateAnother = () => {
    router.push('/calculators/love-calculator');
  };

  const copyTextToClipboard = async (text: string) => {
    if (typeof window === 'undefined') return false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to legacy copy behavior below.
      }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleShareReport = async () => {
    if (typeof window === 'undefined' || !result) return;

    const shareData = {
      title: 'Love Calculator Match',
      text: `Check out our love match! ${result.yourName} & ${result.partnerName} scored ${result.score}%!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      const copied = await copyTextToClipboard(shareData.url);
      if (copied) {
        return;
      }

      window.prompt('Copy this result link:', shareData.url);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      const copied = await copyTextToClipboard(shareData.url);
      if (!copied) {
        window.prompt('Copy this result link:', shareData.url);
      }
    }
  };



  if (!result) {
    return (
      <section className="pt-6 md:pt-12 pb-24">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="font-tiro-devanagari text-[26px] md:text-[36px] font-bold text-[#5D1409] leading-[1.2]">
            No Data Found
          </h2>
          <p className="font-mukta mt-2 text-[#4a4a4a] text-[15px] md:text-[16px] leading-[1.8] max-w-[760px]">
            Please enter your names in the Love Calculator first.
          </p>
          <Link
            href="/calculators/love-calculator"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#5D1409] px-8 font-mukta text-lg font-bold text-white transition-opacity hover:opacity-95"
          >
            Go to Love Calculator
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-6 md:pt-12 pb-12">
      <div>
        {/* Header */}
        <div className="mb-6 md:mb-[50px]">
          <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
            Lovers Report
          </h1>
          <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
            This calculation may or may not be true but you can analyze it.
          </p>
        </div>

        {/* Result Card */}
        <div className="rounded-[16px] border border-[#d4c4b8] p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8">
          {/* Photo */}
          <label
            htmlFor="love-photo-upload"
            className="shrink-0 relative rounded-[19px] overflow-hidden w-full max-w-[320px] h-[332px] md:w-[318px] md:h-[333px] cursor-pointer group"
          >
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="Uploaded couple photo"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Image
                src={UploadPhotoImg}
                alt="Couple photo"
                className="w-full h-full object-cover"
                width={318}
                height={333}
                priority
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition duration-300 group-hover:bg-black/20">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm opacity-0 transition duration-300 group-hover:opacity-100">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5 20h14a1 1 0 001-1v-6h-2v5H6v-5H4v6a1 1 0 001 1zm7-15a1 1 0 011 1v5h4l-5 5-5-5h4V6a1 1 0 011-1z" />
                </svg>
                <span className="text-sm font-semibold">Upload your photo</span>
              </div>
            </div>
            <input
              id="love-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>

          {/* Names + Heart */}
          {/* Mobile: names left/right with heart centered */}
          <div className="w-full md:hidden flex items-center justify-between px-0">
            <div className="w-[20%] text-left">
              <h3 className="font-mukta font-semibold text-[20px] leading-[38px] uppercase text-[#471207]">
                {result.yourName}
              </h3>
            </div>

            <div className="flex-shrink-0 mx-0 relative flex items-center justify-center w-[60%]">
              <div className="relative flex items-center justify-center w-[87.11408996582031px] h-[79.92717742919922px]">
                <Image
                  src={LoveMatchIcon}
                  alt="Heart"
                  width={205}
                  height={188}
                  className="object-contain w-[87.11408996582031px] h-[79.92717742919922px]"
                />
              </div>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-tiro-devanagari font-bold text-white text-[18px] leading-none tracking-[0%] text-center drop-shadow-md">
                  {result.score}%
                </span>
                <span className="font-mukta font-normal text-white text-[10px] leading-none tracking-[0%] text-center">
                  Matched
                </span>
              </div>
            </div>

            <div className="w-[20%] text-right">
              <h3 className="font-mukta font-semibold text-[20px] leading-[38px] uppercase text-[#471207]">
                {result.partnerName}
              </h3>
            </div>
          </div>

          {/* Desktop / tablet: stacked names with heart between */}
          <div className="hidden md:flex flex-col items-center justify-center shrink-0 gap-4 -ml-0 md:-ml-8 self-center md:self-auto w-full md:w-[426px]">
            <h2 className="font-mukta font-semibold text-[20px] md:text-[36px] uppercase text-[#471207] text-center tracking-[0%] leading-[38px] md:leading-[38px]">
              {result.yourName}
            </h2>

            <div className="relative flex items-center justify-center w-[205px] h-[188px]">
              <Image
                src={LoveMatchIcon}
                alt="Heart"
                width={205}
                height={188}
                className="object-contain w-[205px] h-[188px]"
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-tiro-devanagari font-bold text-white text-[64px] leading-none tracking-[0%] text-center drop-shadow-md">
                  {result.score}%
                </span>
                <span className="font-mukta font-normal text-white text-[24px] leading-none tracking-[0%] text-center">
                  Matched
                </span>
              </div>
            </div>

            <h2 className="font-mukta font-semibold text-[20px] md:text-[36px] uppercase text-[#471207] text-center tracking-[0%] leading-[38px] md:leading-[38px]">
              {result.partnerName}
            </h2>
          </div>

          {/* Narrative + Buttons */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-6 md:pt-20 ml-0 md:-ml-12">
            <p className="font-mukta font-normal text-[#2d2d2d] text-[16px] md:text-[24px] leading-[30px] md:leading-[34px] tracking-[0%] max-w-full text-justify px-2 md:px-0">
              Like a love meteorite, your connection will leave a profound impact on the world,
              inspiring others to seek their own cosmic love.
            </p>

            <div className="flex w-full flex-col sm:flex-row items-center gap-3 mt-5 px-2 sm:px-0">
              <button
                onClick={handleShareReport}
                className="flex items-center justify-center gap-[10px] rounded-[40px] w-full sm:w-[204px] h-[50px] p-[12px] bg-[#471207] font-mukta font-semibold text-[18px] leading-[30px] tracking-[0%] text-white transition-colors hover:bg-[#5D1409]"
              >
                <IoShareOutline className="text-lg" />
                Share your match
              </button>

              <button
                onClick={handleCalculateAnother}
                className="flex items-center justify-center gap-[10px] rounded-[32px] border-[2px] border-[#471207] bg-transparent px-[24px] py-[12px] w-full sm:w-[240px] h-[50px] font-mukta font-semibold text-[18px] leading-[30px] tracking-[0%] text-[#471207] transition-colors hover:bg-[#471207] hover:text-white"
              >
                <FiRefreshCcw className="text-base" />
                Calculate Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

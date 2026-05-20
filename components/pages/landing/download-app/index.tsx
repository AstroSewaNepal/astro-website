import { AppleDownloadImage, DownloadPhoneImage, GoogleDownloadImage } from '@/components/images';
import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

type DownloadAppProps = {
  className?: string;
};

const DownloadApp: React.FC<DownloadAppProps> = ({ className }) => {
  return (
    <section className={clsx(className)}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 py-8 md:gap-12 md:px-6 md:py-12 lg:flex-row lg:items-center lg:gap-24 lg:px-4 lg:py-16 xl:gap-36">
      {/* Left Content */}
      <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 max-w-full lg:max-w-[684px] w-full lg:w-auto text-center lg:text-left">
        {/* Title */}
        <h2 className="text-[34px] md:text-[40px] lg:text-[48px] xl:text-5xl 2xl:text-6xl font-normal text-[#691709] leading-tight">
          Download App
        </h2>

        {/* Description */}
        <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl text-[#4A494B] leading-relaxed">
          Experience personalized astrology guidance anytime, anywhere with the AstroSewa app. Get
          daily horoscope updates, instant kundali insights, compatibility checks, and easy access
          to trusted astrologers - all in one place, designed to make your spiritual journey simple
          and meaningful.
        </p>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-5 mt-4 md:mt-5 lg:mt-6 justify-center lg:justify-start">
          {/* Apple Download Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Image
              src={AppleDownloadImage}
              alt="Apple Download"
              width={205}
              height={68}
              className="w-full sm:w-auto h-auto max-w-[180px] md:max-w-[205px] mx-auto sm:mx-0"
            />
          </div>

          {/* Google Play Download Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Image
              src={GoogleDownloadImage}
              alt="Google Download"
              width={205}
              height={68}
              className="w-full sm:w-auto h-auto max-w-[180px] md:max-w-[205px] mx-auto sm:mx-0"
            />
          </div>
        </div>
      </div>

      {/* Right Content - Phone Mockups */}
      <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
        <Image
          src={DownloadPhoneImage}
          alt="Download Phone"
          width={516}
          height={515.39}
          className="w-full max-w-[300px] md:max-w-[400px] lg:max-w-[450px] xl:max-w-[516px] h-auto"
        />
      </div>
      </div>
    </section>
  );
};

export default DownloadApp;

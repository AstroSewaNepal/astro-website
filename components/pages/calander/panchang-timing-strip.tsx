import React from 'react';
import Image from 'next/image';

import SunriseIcon from '@/components/images/icons/sunrise.png';
import SunsetIcon from '@/components/images/icons/sunset.png';
import MoonriseIcon from '@/components/images/icons/moonrise.png';
import MoonsetIcon from '@/components/images/icons/moonset.png';

const panchangTimings = [
  { label: 'Sunrise', time: '05:55 AM', icon: SunriseIcon },
  { label: 'Sunset', time: '07:55 PM', icon: SunsetIcon },
  { label: 'Moonrise', time: '10:55 AM', icon: MoonriseIcon },
  { label: 'Moonset', time: '12:55 AM, Aug 30', icon: MoonsetIcon },
] as const;

const PanchangTimingStrip: React.FC = () => {
  return (
    <div className="mt-8 md:mt-10 w-full max-w-[1454px] min-h-[206px] rounded-[24px] md:rounded-[32px] border border-Trinary px-3 sm:px-4 md:px-[40px] py-4 md:py-[24px] box-border">
      <div className="md:hidden grid grid-cols-2 relative">
        <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-Trinary" />
        <div className="absolute top-1/2 left-2 right-2 h-px -translate-y-1/2 bg-Trinary" />
        {panchangTimings.map(item => (
          <div key={item.label} className="flex flex-col items-center justify-center px-3 py-4">
            <Image src={item.icon} alt={item.label} width={36} height={36} />
            <p className="mt-1.5 font-mukta text-[16px] leading-[22px] font-semibold text-primary text-center">
              {item.label}
            </p>
            <p className="mt-0.5 font-mukta text-[14px] leading-[20px] font-medium text-[#2f1b15] text-center">
              {item.time}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden md:flex h-full items-center justify-between">
        {panchangTimings.map((item, index) => (
          <React.Fragment key={item.label}>
            <div className="flex h-full w-full md:w-auto md:min-w-[250px] flex-col items-center justify-center px-3 md:px-5 py-3 md:py-2">
              <Image
                src={item.icon}
                alt={item.label}
                width={48}
                height={48}
                className="md:w-[54px] md:h-[54px]"
              />
              <p className="mt-2 font-mukta text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] font-semibold text-Trinary text-center">
                {item.label}
              </p>
              <p className="mt-1 md:mt-2 font-mukta text-[18px] leading-[28px] md:text-[26px] md:leading-[40px] font-medium text-primary text-center">
                {item.time}
              </p>
            </div>
            {index < panchangTimings.length - 1 && (
              <div className="hidden md:block h-[68px] w-px bg-[#C7C1CA] opacity-100" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PanchangTimingStrip;

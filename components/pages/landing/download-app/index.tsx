import { AppleDownloadImage, DownloadPhoneImage, GoogleDownloadImage } from '@/components/images';
import Image from 'next/image';
import React from 'react';

const DownloadApp: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-36 px-4 py-16 max-w-7xl mx-auto">
      {/* Left Content */}
      <div className="flex flex-col gap-6 max-w-[684px]">
        {/* Title */}
        <h2 className="text-6xl font-normal text-[#691709] leading-tight">Download App</h2>

        {/* Description */}
        <p className="font-mukta text-2xl text-[#4A494B] leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
          ullamcorper mattis, pulvinar dapibus leo. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>

        {/* Download Buttons */}
        <div className="flex gap-5 mt-6">
          {/* Apple Download Button */}
          <Image src={AppleDownloadImage} alt="Apple Download" width={205} height={68} />

          {/* Google Play Download Button */}
          <Image src={GoogleDownloadImage} alt="Google Download" width={205} height={68} />
        </div>
      </div>

      {/* Right Content - Phone Mockups */}
      <div className="">
        <Image src={DownloadPhoneImage} alt="Download Phone" width={516} height={515.39} />
      </div>
    </div>
  );
};

export default DownloadApp;

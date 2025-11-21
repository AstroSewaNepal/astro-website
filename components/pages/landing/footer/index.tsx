import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  AppleDownloadImage,
  AstroSewaTransparentLogo,
  GoogleDownloadImage,
} from '@/components/images';
import {
  FacebookIcon,
  LinkedinIcon,
  TiktokIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/images/icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5F1508] text-[#F8F3DF]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Left Section - Logo and Download */}
          <div className="flex flex-col gap-14 max-w-[278px]">
            {/* Logo Placeholder */}
            <div className="w-[187px] h-[58px] rounded-lg flex items-center justify-center">
              <Image src={AstroSewaTransparentLogo} alt="Astro Sewa Logo" width={187} height={58} />
            </div>

            {/* Mobile Apps Section */}
            <div className="flex flex-col gap-6">
              <h3 className="font-sahitya text-[22px] font-normal">Astro Sewa Mobile Apps</h3>

              {/* Download Buttons */}
              <div className="flex gap-4">
                {/* Apple Download Button */}
                <div className="w-[133px] h-[44px] bg-black rounded-lg flex items-center justify-center">
                  <Image src={AppleDownloadImage} alt="Apple Download" width={133} height={44} />
                </div>

                {/* Google Play Download Button */}
                <div className="w-[133px] h-[44px] bg-black rounded-lg flex items-center justify-center">
                  <Image src={GoogleDownloadImage} alt="Google Download" width={133} height={44} />
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-2">
              {/* Facebook */}
              <div className="w-[42px] h-[42px] border border-[#F8F3DF] rounded-full flex items-center justify-center">
                <Image src={FacebookIcon} alt="Facebook" width={42} height={42} />
              </div>

              {/* TikTok */}
              <div className="w-[42px] h-[42px] border border-[#F8F3DF] rounded-full flex items-center justify-center">
                <Image src={TiktokIcon} alt="TikTok" width={42} height={42} />
              </div>

              {/* Instagram */}
              <div className="w-[42px] h-[42px] border border-[#F8F3DF] rounded-full flex items-center justify-center">
                <Image src={YoutubeIcon} alt="Youtube" width={42} height={42} />
              </div>

              {/* Twitter */}
              <div className="w-[42px] h-[42px] border border-[#F8F3DF] rounded-full flex items-center justify-center">
                <Image src={TwitterIcon} alt="Twitter" width={42} height={42} />
              </div>

              {/* LinkedIn */}
              <div className="w-[42px] h-[42px] border border-[#F8F3DF] rounded-full flex items-center justify-center">
                <Image src={LinkedinIcon} alt="LinkedIn" width={42} height={42} />
              </div>
            </div>
          </div>

          {/* Right Section - Links and Contact */}
          <div>
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-30 flex-1">
              {/* Quick Links */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[22px] font-normal mb-3">Quick Links</h4>
                <div className="flex flex-col gap-2">
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Free Kundali
                  </a>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Kundali Matching
                  </a>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Horoscope
                  </a>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Talk to Astrologer
                  </a>
                  <Link
                    href="/puja-bidhi"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Puja Bidhi
                  </Link>
                  <Link
                    href="/blogs"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Blog
                  </Link>
                </div>
              </div>

              {/* Useful Links */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[22px] font-normal mb-3">Useful Links</h4>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/about-us"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    About Us
                  </Link>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Contact Us
                  </a>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Astrologer Registration
                  </a>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Zodiac Sign
                  </a>
                  <a
                    href="#"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Calculator
                  </a>
                </div>
              </div>

              {/* Contact Us */}
              <div className="flex flex-col gap-3 max-w-[243px]">
                <h4 className="text-[22px] font-normal mb-3">Contact Us</h4>
                <div className="flex flex-col gap-6">
                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <span className="font-mukta text-[18px] font-medium">+977 9818080676</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <span className="font-mukta text-[18px] font-medium">
                      support@astrosewa.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="flex items-center gap-8 mt-8">
              <Link
                href="/terms-and-conditions"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Terms & Conditions
              </Link>
              <div className="w-px h-6 bg-[#F8F3DF]"></div>
              <Link
                href="/pricing-policy"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Pricing Policy
              </Link>
              <div className="w-px h-6 bg-[#F8F3DF]"></div>
              <Link
                href="/disclaimer"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F8F3DF] border-opacity-20"></div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-1">
            <span className="font-mukta text-[18px] font-normal">Copyright © 2025 AstroSewa</span>
            <span className="font-mukta text-[18px] font-normal">|| All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

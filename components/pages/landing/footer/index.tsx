import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import PhoneIcon from '@/components/icons/phone-icon';
import {
  AppleDownloadImage,
  AstroSewaTransparentLogo,
  GoogleDownloadImage,
  FBLogo,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  XLogo,
  LinkedinLogo,
} from '@/components/images';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5F1508] text-[#F8F3DF]">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-0 py-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-center lg:items-start text-center lg:text-left">
          {/* Left Section - Logo and Download */}
          <div className="flex flex-col gap-14 max-w-[278px] w-full lg:max-w-[278px] lg:w-auto mx-auto lg:mx-0 items-center lg:items-start text-center lg:text-left">
            {/* Logo Placeholder */}
            <div className="w-[187px] h-[58px] rounded-lg flex items-center justify-center mx-auto lg:mx-0">
              <Image src={AstroSewaTransparentLogo} alt="Astro Sewa Logo" width={187} height={58} />
            </div>

            {/* Mobile Apps Section */}
            <div className="flex flex-col gap-6 w-full">
              <h3 className="font-sahitya text-[22px] font-normal">Astro Sewa Mobile Apps</h3>

              {/* Download Buttons */}
              <div className="flex flex-col items-center lg:flex-row lg:items-center gap-4">
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
            <div className="flex justify-center gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/astrosewaofficial"
                target="_blank"
                rel="noreferrer noopener"
                className="w-[40px] h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                aria-label="Astro Sewa on Facebook"
              >
                <Image
                  src={FBLogo}
                  alt="Facebook"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/astrosewaofficial/"
                target="_blank"
                rel="noreferrer noopener"
                className="w-[40px] h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                aria-label="Astro Sewa on Instagram"
              >
                <Image
                  src={InstagramLogo}
                  alt="Instagram"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@astrosewaofficial"
                target="_blank"
                rel="noreferrer noopener"
                className="w-[40px] h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                aria-label="Astro Sewa on TikTok"
              >
                <Image
                  src={TiktokLogo}
                  alt="TikTok"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@astrosewaofficial"
                target="_blank"
                rel="noreferrer noopener"
                className="w-[40px] h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                aria-label="Astro Sewa on YouTube"
              >
                <Image
                  src={YoutubeLogo}
                  alt="YouTube"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>

              {/* X */}
              <a
                href="https://x.com/astro_sewa"
                target="_blank"
                rel="noreferrer noopener"
                className="w-[40px] h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                aria-label="Astro Sewa on X"
              >
                <Image src={XLogo} alt="X" width={40} height={40} className="object-contain" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/astrosewa/"
                target="_blank"
                rel="noreferrer noopener"
                className="w-[40px] h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                aria-label="Astro Sewa on LinkedIn"
              >
                <Image
                  src={LinkedinLogo}
                  alt="LinkedIn"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>
            </div>
          </div>

          {/* Right Section - Links and Contact */}
          <div className="w-full">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-30 flex-1 justify-center">
              {/* Quick Links */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[22px] font-normal mb-3">Quick Links</h4>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/free-kundali"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Free Kundali
                  </Link>
                  <Link
                    href="/kundali-matching"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Free Kundali Matching
                  </Link>
                  <Link
                    href="/horoscope"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Horoscope
                  </Link>
                  <Link
                    href="/"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Talk to Astrologer
                  </Link>
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
                    href="https://wa.me/9779818080676?text=Hello%20AstroSewa%20team%2C%20I%20would%20like%20to%20discuss%20your%20services%20and%20need%20some%20assistance%20with%20my%20astrology%20requirements.%20Please%20let%20me%20know%20the%20best%20way%20to%20proceed."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Contact Us
                  </a>
                  <a
                    href="mailto:support@astrosewa.com?subject=Astrologer%20Registration"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Astrologer Registration
                  </a>
                  <Link
                    href="/zodiac-sign"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Zodiac Sign
                  </Link>
                  <Link
                    href="/calculators"
                    className="font-mukta text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Calculator
                  </Link>
                </div>
              </div>

              {/* Contact Us */}
              <div className="flex flex-col gap-3 max-w-[243px] w-full mx-auto lg:mx-0">
                <h4 className="text-[22px] font-normal mb-3">Contact Us</h4>
                <div className="flex flex-col gap-6">
                  {/* Phone */}
                  <div className="flex items-center justify-center gap-3 lg:justify-start">
                    <div
                      className="flex h-[22px] w-[22px] items-center justify-center rounded"
                      style={{ opacity: 1, transform: 'rotate(0deg)' }}
                    >
                      <PhoneIcon className="h-[22px] w-[22px] text-[#F8F3DF]" />
                    </div>
                    <a
                      href="https://wa.me/9779818080676?text=Hello%20AstroSewa%20team%2C%20I%20would%20like%20to%20discuss%20your%20services%20and%20need%20some%20assistance%20with%20my%20astrology%20requirements.%20Please%20let%20me%20know%20the%20best%20way%20to%20proceed."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mukta text-[18px] font-medium text-[#F8F3DF] hover:opacity-75 transition-opacity"
                    >
                      +977 9818080676
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-center gap-3 lg:justify-start">
                    <div
                      className="flex h-[22px] w-[22px] items-center justify-center rounded"
                      style={{ opacity: 1, transform: 'rotate(0deg)' }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[22px] w-[22px] text-[#F8F3DF] opacity-100"
                      >
                        <path
                          d="M20 6H4C2.9 6 2 6.9 2 8V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16V8C22 6.9 21.1 6 20 6Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path d="M22 8L12 13L2 8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <a
                      href="mailto:support@astrosewa.com"
                      className="font-mukta text-[18px] font-medium text-[#F8F3DF] hover:opacity-75 transition-opacity"
                    >
                      support@astrosewa.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
              <Link
                href="/terms-and-conditions"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Terms & Conditions
              </Link>
              <div className="w-px h-6 bg-[#F8F3DF]"></div>
              <Link
                href="/privacy-policy"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Privacy Policy
              </Link>
              <div className="w-px h-6 bg-[#F8F3DF]"></div>
              <Link
                href="/disclaimer"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Disclaimer
              </Link>
              <div className="w-px h-6 bg-[#F8F3DF]"></div>
              <Link
                href="/pricing-policy"
                className="font-mukta text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
              >
                Pricing Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F8F3DF] border-opacity-20"></div>

      {/* Bottom Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-0 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
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
